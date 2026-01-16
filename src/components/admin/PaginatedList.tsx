import MultiSelect from '@/components/admin/MultiSelect'
import { IPaginatedResponse, zPaginatedResponse } from '@/contracts/responses'
import { useFetch } from '@/util/hooks'
import {
    keepPreviousData,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query'
import classNames from 'classnames'
import { useEffect, useState } from 'react'
import {
    FiChevronLeft,
    FiChevronRight,
    FiChevronsLeft,
    FiChevronsRight,
} from 'react-icons/fi'
import { IoMdOptions } from 'react-icons/io'
import { IoClose } from 'react-icons/io5'
import { IconType } from 'react-icons/lib'
import z from 'zod'

export interface IPaginatedListItem<T> {
    id: string
    value: T
}

export interface PaginatedListProps<T extends object> {
    zodSchema: z.ZodObject
    eventTarget?: EventTarget
    endpoint: string
    filters: Filter[]
    searchFields: ({ name: string; id: string } | string)[]
    items: IPaginatedListItem<T>[]
    pinnedItem?: IPaginatedListItem<T> | null
    selectedItem: IPaginatedListItem<T> | null
    renderItem: (item: IPaginatedListItem<T>) => React.ReactElement
    onSelectItem: (item: IPaginatedListItem<T>) => void
    setItems: (items: T[]) => void
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

export const zPaginatedSearch = z.object({
    page: z.coerce.number(),
    limit: z.coerce.number(),

    query: z.string(),
    field: z.string(),
    sort: z.string(),

    filters: z.record(z.string(), z.array(z.string())),
})

export type IPaginatedSearch = z.infer<typeof zPaginatedSearch>

export default function PaginatedList<T extends object>({
    zodSchema,
    eventTarget,
    endpoint,
    filters,
    searchFields,
    pinnedItem,
    selectedItem,
    items,
    renderItem,
    onSelectItem,
    setItems,
}: PaginatedListProps<T>) {
    const [search, setSearch] = useState<IPaginatedSearch>({
        page: 0,
        limit: 25,
        query: '',
        field: 'all',
        sort: '',
        filters: {},
    })

    const [filtersOpen, setFiltersOpen] = useState(false)
    const [activeFilterMenu, setActiveFilterMenu] = useState<string | null>(
        null
    )

    const { onGet } = useFetch()

    const queryClient = useQueryClient()
    const { isPending, isSuccess, data, error, refetch } = useQuery({
        queryKey: [endpoint, search],
        async queryFn({ signal }) {
            if (!search) return null

            const url = new URL(location.href)
            url.pathname = endpoint

            const params = {} as Record<string, string>
            for (const [key, values] of Object.entries(search.filters)) {
                params[key] = values.join(',')
            }

            params.page = search.page.toString()
            params.limit = search.limit.toString()
            if (search.query) params.query = search.query
            if (search.field) params.field = search.field
            if (search.sort) params.sort = search.sort

            const res = await onGet<IPaginatedResponse<T>>(
                url.pathname,
                zPaginatedResponse(zodSchema),
                { query: params, signal }
            )

            return res
        },
        placeholderData: keepPreviousData,
    })

    useEffect(() => {
        if (isSuccess && data) {
            setItems(data.data)
        }
    }, [isSuccess, data, setItems])

    useEffect(() => {
        void refetch()
        return () =>
            void queryClient.cancelQueries({
                //change this route to api route
                queryKey: ['/users', search],
            })
    }, [search, refetch, queryClient])

    useEffect(() => {
        if (!eventTarget) return

        function handleSaveChanges() {
            void refetch()
        }

        eventTarget.addEventListener('refetch', handleSaveChanges)

        return () => {
            eventTarget.removeEventListener('refetch', handleSaveChanges)
        }
    }, [eventTarget, refetch])

    const itemsWithPinned = pinnedItem
        ? [pinnedItem, ...items.filter((item) => item.id !== pinnedItem.id)]
        : items
    const pages = data
        ? Math.ceil((pinnedItem ? data.count - 1 : data.count) / data.limit)
        : 0

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
                        value={search.query}
                        onChange={(e) =>
                            setSearch({ ...search, query: e.target.value })
                        }
                    />
                    <button
                        title={filtersOpen ? 'Hide Filters' : 'Show Filters'}
                        onClick={() => setFiltersOpen(!filtersOpen)}
                    >
                        {filtersOpen ? (
                            <IoClose size={20} />
                        ) : (
                            <IoMdOptions size={20} />
                        )}
                    </button>
                </div>
                {filtersOpen && (
                    <>
                        <div className="flex w-full flex-wrap justify-between gap-2">
                            {searchFields.length && (
                                <label
                                    htmlFor="search_field"
                                    className="flex shrink items-center gap-2"
                                >
                                    <span className="font-medium">Filter:</span>
                                    <select
                                        name="search_field"
                                        id="search_field"
                                        className="rounded-lg border border-gray-300 bg-white p-1"
                                        defaultValue={'all'}
                                        onChange={(e) =>
                                            setSearch({
                                                ...search,
                                                field: e.target.value,
                                            })
                                        }
                                    >
                                        <option value={'all'}>
                                            All (exact only)
                                        </option>
                                        {searchFields.map((sf) => (
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
                            <label
                                htmlFor="limit"
                                className="flex items-center gap-2"
                            >
                                <span className="font-medium">Items:</span>
                                <select
                                    name="limit"
                                    id="limit"
                                    className="rounded-lg border border-gray-300 bg-white p-1"
                                    defaultValue={search.limit}
                                    onChange={(e) =>
                                        setSearch({
                                            ...search,
                                            limit: +e.target.value,
                                        })
                                    }
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                            </label>
                        </div>
                        {data ? (
                            <label
                                htmlFor="Sort"
                                className="flex items-center gap-2"
                            >
                                <span className="font-medium">Sort:</span>
                                <select
                                    name="sort"
                                    id="sort"
                                    className="rounded-lg border border-gray-300 bg-white p-1"
                                    value={search.sort}
                                    onChange={(e) => {
                                        setSearch({
                                            ...search,
                                            sort: e.target.value,
                                        })
                                    }}
                                >
                                    <option value={'asc'}>Ascending</option>
                                    <option value={'desc'}>Descending</option>
                                </select>
                            </label>
                        ) : (
                            <div className="d-none"></div>
                        )}
                        {filters?.map((f) => (
                            <div key={f.name} className="flex flex-wrap gap-2">
                                <strong className="font-medium">
                                    {f.name}:
                                </strong>
                                <MultiSelect
                                    name={f.name}
                                    displayKey={f.display_key}
                                    valueKey={f.value_key}
                                    options={f.options}
                                    active={search.filters[f.query_key] ?? []}
                                    addActive={(value) => {
                                        search.filters[f.query_key] = [
                                            ...(search.filters[f.query_key] ??
                                                []),
                                            value,
                                        ]
                                        setSearch({
                                            ...search,
                                            filters: { ...search.filters },
                                        })
                                    }}
                                    removeActive={(value) => {
                                        search.filters[f.query_key] = (
                                            search.filters[f.query_key] ?? []
                                        ).filter((v) => v !== value)
                                        setSearch({
                                            ...search,
                                            filters: { ...search.filters },
                                        })
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

            <ul className="overflow-y-auto">
                {isSuccess && items.length > 0 ? (
                    itemsWithPinned.map((item) => (
                        <ListElement
                            key={item.id}
                            selected={item.id === selectedItem?.id}
                            pinned={item.id === pinnedItem?.id}
                            onClick={() =>
                                item.id !== selectedItem?.id &&
                                onSelectItem(item)
                            }
                        >
                            {renderItem(item)}
                        </ListElement>
                    ))
                ) : (
                    <div className="flex flex-1 items-center justify-center">
                        {isPending ? (
                            <span className="text-gray-400">Loading...</span>
                        ) : error ? (
                            <span className="text-red-500">
                                Error: {error.message}
                            </span>
                        ) : (
                            <span>No results found</span>
                        )}
                    </div>
                )}
            </ul>

            <div className="mt-auto flex gap-4 border-t-2">
                <Pagination
                    page={search?.page ?? 0}
                    pages={pages}
                    onPageChange={(page) => setSearch({ ...search, page })}
                    enabled={!isPending}
                    total={data?.count ?? 0}
                />
            </div>
        </div>
    )
}

export interface ListElementProps {
    selected: boolean
    pinned?: boolean
    children: React.ReactNode
    onClick: () => void
}

export function ListElement({
    selected,
    pinned,
    children,
    onClick,
}: ListElementProps) {
    return (
        <li
            className={classNames(
                'flex cursor-pointer items-center gap-5 p-4',
                {
                    'border-b-2 bg-gray-200 border-gray-300': pinned,
                    'border-b': !pinned,
                    'bg-gray-300 hover:bg-gray-400': pinned && selected,
                    'hover:bg-gray-300': pinned && !selected,
                    'bg-gray-200 hover:bg-gray-300': !pinned && selected,
                    'hover:bg-gray-200': !pinned && !selected,
                }
            )}
            onClick={onClick}
        >
            {children}
        </li>
    )
}

interface PaginationProps {
    page: number
    pages: number
    enabled: boolean
    total: number
    onPageChange: (page: number) => void
}

function Pagination({
    page,
    pages,
    enabled,
    total,
    onPageChange,
}: PaginationProps) {
    const [value, setValue] = useState('')

    const canChange = pages > 1

    const handleChangeValue = (value: string) => {
        if (!value || (/^\d+$/.test(value) && value.length < 10))
            setValue(value)
    }

    const handleSubmit = () => {
        const newPage = +value - 1 || page
        if (0 < newPage && newPage < pages) onPageChange(newPage)
        else setValue((page + 1).toString())
    }

    useEffect(() => {
        setValue((page + 1).toString())
    }, [page])

    return (
        <div className="flex w-full items-center justify-between">
            <div className="mx-auto flex items-center justify-center gap-1 p-4">
                <PaginationArrow
                    onClick={() => onPageChange(0)}
                    icon={FiChevronsLeft}
                    title="First"
                    enabled={canChange && page > 0}
                />
                <PaginationArrow
                    onClick={() => onPageChange(page - 1)}
                    icon={FiChevronLeft}
                    title="Previous"
                    enabled={canChange && page > 0}
                />
                <form
                    className="flex items-center gap-2 px-2"
                    onSubmit={(e) => {
                        e.preventDefault()
                        handleSubmit()
                    }}
                >
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => handleChangeValue(e.target.value)}
                        onBlur={handleSubmit}
                        disabled={!enabled}
                        className="w-[6ch] max-w-min rounded-lg border border-gray-300 px-2 py-0.5 text-center"
                    />
                    <input type="submit" className="hidden" />
                    <span className="text-gray-600">
                        of <span title={`${total} total results`}>{pages}</span>
                    </span>
                </form>
                <PaginationArrow
                    onClick={() => onPageChange(page + 1)}
                    icon={FiChevronRight}
                    title="Next"
                    enabled={canChange && page < pages - 1}
                />
                <PaginationArrow
                    onClick={() => onPageChange(pages - 1)}
                    icon={FiChevronsRight}
                    title="Last"
                    enabled={canChange && page < pages - 1}
                />
            </div>
        </div>
    )
}

interface PaginationArrowProps {
    onClick: () => void
    icon: IconType
    title: string
    enabled: boolean
}

function PaginationArrow({
    onClick,
    icon: Icon,
    title,
    enabled,
}: PaginationArrowProps) {
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
