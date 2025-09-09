import MultiSelect from '@/components/admin/MultiSelect'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useDebounce } from '@uidotdev/usehooks'
import classNames from 'classnames'
import Image from 'next/image'
import { FC, useEffect, useState } from 'react'
import {
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
} from 'react-icons/fi'
import { IoMdOptions } from 'react-icons/io'
import { IoClose } from 'react-icons/io5'
import { IconType } from 'react-icons/lib'

export interface PaginatedListProps<T extends object> {
  event_target?: EventTarget
  /**
   * The endpoint that will be used to fetch the data
   */
  api_endpoint: string

  /**
   * Called when an element in the list is selected by the user. The handler can
   * return false to disallow the selection (like if there are edits in progress
   * for example)
   */
  before_element_selection?: (value: T) => boolean

  /**
   * Called after an element is selected from the list
   */
  on_element_selected: (value: T) => void

  id_key: keyof T
  display_key: keyof T | ((value: T) => string)
  alternate_display_key?: keyof T | ((value: T) => string)
  image?: {
    key: keyof T
    alt: string
  }

  filters: Filter[]
  search_fields?: ({ name: string; id: string } | string)[]
}

export interface Filter {
  /**
   * The name to display in the filter dropdown
   */
  name: string
  /**
   * The key to use when constructing the query parameters for the fetch
   */
  query_key: string
  /**
   * The key to use when displaying each option
   */
  display_key: string
  /**
   * The key to use when getting the value of an option
   */
  value_key: string
  /**
   * Values for each filter option
   */
  options: Record<string, string>[]
}

export interface PaginatedResponse<T> {
  page: number
  limit: number
  pages: number
  count: number
  data: T[]
}

export default function PaginatedList<T extends object>(
  props: PaginatedListProps<T>
) {
  const [page, setPage] = useState(0)
  const [pages, setPages] = useState(1)
  const [limit, setLimit] = useState(25)
  const [selected_id, set_selected_id] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [searchField, setSearchField] = useState<string>('all')

  const [filtersOpen, setFiltersOpen] = useState(false)
  const [activeFilterMenu, setActiveFilterMenu] = useState<string | null>(
    null
  )
  const [searchFilters, setSearchFilters] = useState<
    Record<string, string[]>
  >({})
  const [sortOrder, setSortOrder] = useState('')


  const searchParams = useDebounce(
    [page, pages, limit, searchQuery, searchField, searchFilters, sortOrder],
    50
  )
  const sortedData = (arr: T[], count: number, setting: string, field: string) => {
    const obj: PaginatedResponse<T> = {
      page: page,
      limit: limit,
      pages: pages,
      count: count,
      data: setting === ''
        ? arr
        : setting === 'A-Z'
          ? arr.sort((a, b) => (a[field] < b[field] ? -1 : 1))
          : setting === 'Z-A'
            ? arr.sort((a, b) => (a[field] > b[field] ? -1 : 1))
            : arr
    }
    return obj
  }


  const { isPending, isSuccess, error, data, refetch } = useQuery<
    PaginatedResponse<T>
  >({
    queryKey: [props.api_endpoint, ...searchParams],
    queryFn: async ({ signal }) => {
      const url = new URL(location.href)
      url.pathname = props.api_endpoint
      url.searchParams.set('page', page + '')
      url.searchParams.set('limit', limit + '')
      if (searchQuery) url.searchParams.set('query', searchQuery)
      if (searchField !== 'all')
        url.searchParams.set('search_field', searchField)

      for (const [key, values] of Object.entries(searchFilters)) {
        for (const value of values) {
          url.searchParams.append(key, value)
        }
      }
      console.log(url.search)

      const res = await fetch(url, { signal })
      return (await res.json()) as PaginatedResponse<T>
    },
    placeholderData: keepPreviousData,
  })

  const sortedList = sortedData(data?.data, data?.count, sortOrder, searchField)
  console.log(sortedList)
  useEffect(() => {
    if (isSuccess) {
      setPage(data?.page)
      setLimit(data?.limit)
      setPages(data?.pages)
    }
  }, [isSuccess, data, sortedList])


  const handleListItemClick = (clicked_id: string) => {
    const selected = data?.data.find((e) => e[props.id_key] === selected_id)
    const clicked = data?.data.find((e) => e[props.id_key] === clicked_id)

    if (!clicked || selected === clicked) return

    if (
      props.before_element_selection &&
      !props.before_element_selection(clicked)
    )
      return

    set_selected_id(clicked_id)
    props.on_element_selected(clicked)
  }

  useEffect(() => {
    const { event_target } = props
    if (!event_target) return

    function handleSaveChanges() {
      void refetch()
    }

    event_target.addEventListener('refetch', handleSaveChanges)

    return () => {
      event_target.removeEventListener('refetch', handleSaveChanges)
    }
  }, [props.event_target])

  return (
    <div className="flex w-96 flex-col self-stretch border-x-2 border-gray-200 bg-gray-50 2xl:w-[28rem]">
      <div className="flex flex-col gap-3 border-b-2 p-4">
        <div className="flex w-full items-center gap-2">
          <input
            type="text"
            name="search_query"
            id="search_query"
            className="w-full rounded-lg border border-gray-300 px-3 py-1"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {props.filters.length > 0 && (
            <button
              title={
                filtersOpen ? 'Hide Filters' : 'Show Filters'
              }
              onClick={() => setFiltersOpen(!filtersOpen)}
            >
              {filtersOpen ? (
                <IoClose size={20} />
              ) : (
                <IoMdOptions size={20} />
              )}
            </button>
          )}
        </div>
        {filtersOpen && (
          <>
            <div className="flex w-full justify-between gap-2">
              {props.search_fields && (
                <label
                  htmlFor="search_field"
                  className="flex shrink items-center gap-2"
                >
                  <span className="font-medium">Field:</span>
                  <select
                    name="search_field"
                    id="search_field"
                    className="rounded-lg border border-gray-300 bg-white p-1"
                    defaultValue={'all'}
                    onChange={(e) =>
                      setSearchField(e.target.value)
                    }
                  >
                    <option value={'all'}>
                      All (exact only)
                    </option>
                    {props.search_fields.map((sf) => (
                      <option
                        key={
                          typeof sf === 'string'
                            ? sf
                            : sf.id
                        }
                        value={
                          typeof sf === 'string'
                            ? sf
                            : sf.id
                        }
                      >
                        {typeof sf === 'string'
                          ? sf
                          : sf.name}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              {data && searchField !== 'all' ? (
                <label
                  htmlFor='Sort'
                  className='flex items-center gap-2'
                >
                  <span className='font-medium'>Sort:</span>
                  <select
                    name="sort"
                    id="sort"
                    className='rounded-lg border border-gray-300 bg-white p-1'
                    value={sortOrder}
                    onChange={(e) => {
                      setSortOrder(e.target.value)
                    }
                    }
                  >
                    <option value={''}>...</option>
                    <option value={'A-Z'}>A-Z</option>
                    <option value={'Z-A'}>Z-A</option>
                  </select>
                </label>
              ) :
                <div
                  className='d-none'
                >
                </div>
              }

              <label
                htmlFor="limit"
                className="flex items-center gap-2"
              >
                <span className="font-medium">Items:</span>
                <select
                  name="limit"
                  id="limit"
                  className="rounded-lg border border-gray-300 bg-white p-1"
                  defaultValue={limit}
                  onChange={(e) => setLimit(+e.target.value)}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </label>
            </div>

            {props.filters?.map((f) => (
              <div key={f.name} className="flex flex-wrap gap-2">
                <strong className="font-medium">
                  {f.name}:
                </strong>
                <MultiSelect
                  {...f}
                  active={searchFilters[f.query_key] ?? []}
                  addActive={(value) => {
                    searchFilters[f.query_key] = [
                      ...(searchFilters[f.query_key] ??
                        []),
                      value,
                    ]
                    setSearchFilters({ ...searchFilters })
                  }}
                  removeActive={(value) => {
                    searchFilters[f.query_key] = (
                      searchFilters[f.query_key] ?? []
                    ).filter((v) => v !== value)
                    setSearchFilters({ ...searchFilters })
                  }}
                  menuOpen={activeFilterMenu == f.query_key}
                  setMenuOpen={(open) =>
                    setActiveFilterMenu(
                      open ? f.query_key : null
                    )
                  }
                />
              </div>
            ))}
          </>
        )}
      </div>

      {sortedList && sortedList.count > 0 ? (
        <ul className="overflow-y-auto">
          {sortedList.data.map((e) => (
            <li
              key={e[props.id_key] as string}
              className={classNames(
                'flex cursor-pointer items-center gap-5 p-4',
                {
                  'bg-gray-200 hover:bg-gray-300':
                    selected_id === e[props.id_key],
                  'hover:bg-gray-200':
                    selected_id !== e[props.id_key],
                }
              )}
              onClick={() =>
                handleListItemClick(e[props.id_key] as string)
              }
            >
              {props.image && (
                <ImageWithFallback
                  src={e[props.image.key] as string}
                  alt={props.image.alt}
                />
              )}

              <div className="flex flex-col">
                <span className="font-medium text-black">
                  {typeof props.display_key === 'function'
                    ? props.display_key(e)
                    : (e[props.display_key] as string)}
                </span>
                {props.alternate_display_key && (
                  <span className="text-gray-500">
                    {typeof props.alternate_display_key ===
                      'function'
                      ? props.alternate_display_key(e)
                      : (e[
                        props.alternate_display_key
                      ] as string)}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-1 items-center justify-center">
          {isPending && (
            <span className="text-gray-400">Loading...</span>
          )}
          {error && (
            <span className="text-red-500">
              Error: {error.message}
            </span>
          )}
          {data?.count === 0 && <>No results found</>}
        </div>
      )}

      <div className="mt-auto flex gap-4 border-t-2">
        <Pagination
          page={page + 1}
          maxPage={pages}
          onPageChange={(page) => setPage(page - 1)}
          enabled={!isPending}
          total={data?.count ?? 0}
        />
      </div>
    </div>
  )
}

const Pagination: FC<{
  page: number
  onPageChange: (page: number) => void
  maxPage: number
  enabled: boolean
  total: number
}> = ({ page, onPageChange, maxPage, enabled, total }) => {
  const can_change = maxPage > 1

  const [value, setValue] = useState(page.toString())

  useEffect(() => {
    setValue(page.toString())
  }, [page])

  return (
    <div className="flex w-full items-center justify-between">
      <div className="mx-auto flex items-center justify-center gap-1 p-4">
        <PaginationArrow
          onClick={() => onPageChange(1)}
          icon={FiChevronsLeft}
          title="First"
          enabled={can_change && page > 1}
        />
        <PaginationArrow
          onClick={() => onPageChange(page - 1)}
          icon={FiChevronLeft}
          title="Previous"
          enabled={can_change && page > 1}
        />
        <form
          className="flex items-center gap-2 px-2"
          onSubmit={(e) => {
            e.preventDefault()

            const p = +value || page
            setValue(p.toString())
            onPageChange(p)
          }}
        >
          <input
            type="text"
            value={value}
            onChange={(e) => {
              if (
                e.target.value.length === 0 ||
                (/^\d+$/.test(e.target.value) &&
                  e.target.value.length < 10)
              ) {
                setValue(e.target.value)
              }
            }}
            onBlur={() => {
              if (value.length === 0) setValue(page.toString())
            }}
            disabled={!enabled}
            className="w-[6ch] max-w-min rounded-lg border border-gray-300 px-2 py-0.5 text-center"
          />
          <input type="submit" className="hidden" />
          <span className="text-gray-600">
            of{' '}
            <span title={`${total} total results`}>{maxPage}</span>
          </span>
        </form>
        <PaginationArrow
          onClick={() => onPageChange(page + 1)}
          icon={FiChevronRight}
          title="Next"
          enabled={can_change && page < maxPage}
        />
        <PaginationArrow
          onClick={() => onPageChange(maxPage)}
          icon={FiChevronsRight}
          title="Last"
          enabled={can_change && page < maxPage}
        />
      </div>
    </div>
  )
}

const PaginationArrow: FC<{
  onClick: () => void
  icon: IconType
  title: string
  enabled: boolean
}> = ({ onClick, icon: Icon, title, enabled }) => {
  return (
    <a
      className={classNames(
        'flex select-none items-center justify-center rounded-lg p-1.5 font-semibold',
        {
          'cursor-pointer text-gray-700 hover:bg-gray-200 active:bg-gray-100':
            enabled,
          'cursor-not-allowed text-gray-400': !enabled,
        }
      )}
      onClick={() => enabled && onClick()}
      title={title}
    >
      <Icon size={20} />
    </a>
  )
}

const ImageWithFallback: FC<{ src: string; alt: string }> = ({ src, alt }) => {
  const [hasErrored, setHasErrored] = useState(false)

  return (
    <Image
      src={
        hasErrored
          ? 'https://dummyjson.com/image/100x100/e8e0e0/d0c8c8?text=!&fontFamily=Poppins'
          : src
      }
      alt={alt}
      width={48}
      height={48}
      className="aspect-square max-h-[48px] rounded-full"
      onError={() => setHasErrored(true)}
    />
  )
}
