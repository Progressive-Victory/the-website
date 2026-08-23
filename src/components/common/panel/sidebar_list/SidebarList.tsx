import styles from './SidebarList.module.css'
import { MultiSelect, type MultiSelectOption } from '@/components/common'
import { type SearchRequest, SortDirection } from '@/contracts/requests'
import { useEffect, useState } from 'react'
import {
    FiChevronLeft,
    FiChevronRight,
    FiChevronsLeft,
    FiChevronsRight,
} from 'react-icons/fi'
import type { IconType } from 'react-icons/lib'

export {
    SidebarBody,
    type SidebarBodyProps,
    type SidebarBodyItemConfig,
} from './SidebarBody'

export interface SidebarListFilterOption {
    value: string
    label: string
    options: MultiSelectOption[]
}

export interface SidebarListFieldOption {
    value: string
    label: string
}

export interface SidebarListFiltersProps {
    search: SearchRequest
    onSearch: (search: SearchRequest) => void
    options?: SidebarListFilterOption[]
    searchFieldOptions?: SidebarListFieldOption[]
    sortFieldOptions?: SidebarListFieldOption[]
    showLimit?: boolean
    showSort?: boolean
    limitOptions?: number[]
}

export type SidebarListFiltersConfig = SidebarListFiltersProps

export function SidebarListFilters({
    search,
    onSearch,
    options = [],
    searchFieldOptions,
    sortFieldOptions,
    showLimit = true,
    showSort = true,
    limitOptions = [5, 10, 25, 50, 100],
}: SidebarListFiltersProps) {
    const {
        query,
        searchField,
        sortField,
        limit,
        sort,
        page,
        ...activeFilters
    } = search as SearchRequest & Record<string, unknown>

    const handleChangeLimit = (nextLimit: number) => {
        onSearch({ ...search, limit: nextLimit, page: 0 })
    }

    const handleChangeSearchField = (nextSearchField: string | undefined) => {
        onSearch({ ...search, searchField: nextSearchField, page: 0 })
    }

    const handleChangeSortField = (nextSortField: string | undefined) => {
        onSearch({ ...search, sortField: nextSortField, page: 0 })
    }

    const handleChangeSort = (nextSort: SortDirection) => {
        onSearch({ ...search, sort: nextSort, page: 0 })
    }

    const handleChangeFilter = (
        value: string,
        selected: (string | number)[]
    ) => {
        const nextFilters = {
            ...(activeFilters as Record<string, (string | number)[]>),
        }

        if (selected.length) nextFilters[value] = selected
        else delete nextFilters[value]

        onSearch({
            query,
            searchField,
            sortField,
            limit,
            sort,
            page,
            ...nextFilters,
        })
    }

    return (
        <div className={styles.controls}>
            {searchFieldOptions?.length ? (
                <label className={styles.select}>
                    <span>Search Field:</span>
                    <select
                        defaultValue={searchField ?? 'all'}
                        onChange={(event) => {
                            const value = event.target.value
                            handleChangeSearchField(
                                value === 'all' ? undefined : value
                            )
                        }}
                    >
                        <option value="all">All</option>
                        {searchFieldOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </label>
            ) : null}

            {sortFieldOptions?.length ? (
                <label className={styles.select}>
                    <span>Sort Field:</span>
                    <select
                        defaultValue={sortField ?? 'all'}
                        onChange={(event) => {
                            const value = event.target.value
                            handleChangeSortField(
                                value === 'all' ? undefined : value
                            )
                        }}
                    >
                        <option value="all">All</option>
                        {sortFieldOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </label>
            ) : null}

            {showLimit ? (
                <label className={styles.select}>
                    <span>Items:</span>
                    <select
                        defaultValue={limit ?? 25}
                        onChange={(event) =>
                            handleChangeLimit(+event.target.value)
                        }
                    >
                        {limitOptions.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </label>
            ) : null}

            {showSort ? (
                <label className={styles.select}>
                    <span>Sort:</span>
                    <select
                        defaultValue={sort ?? SortDirection.DESC}
                        onChange={(event) =>
                            handleChangeSort(
                                event.target.value as SortDirection
                            )
                        }
                    >
                        <option value={SortDirection.DESC}>Descending</option>
                        <option value={SortDirection.ASC}>Ascending</option>
                    </select>
                </label>
            ) : null}

            {options.map((option) => (
                <div key={option.label} className={styles.filterSelect}>
                    <strong>{option.label}:</strong>
                    <MultiSelect
                        name={option.label}
                        options={option.options}
                        selected={
                            ((activeFilters as Record<string, unknown>)[
                                option.value
                            ] as (string | number)[]) ?? []
                        }
                        onUpdate={(selected) =>
                            handleChangeFilter(option.value, selected)
                        }
                    />
                </div>
            ))}
        </div>
    )
}

export interface SidebarListSearchProps {
    search: SearchRequest
    onSearch: (search: SearchRequest) => void
    placeholder?: string
    inputId?: string
}

export function SidebarListSearch({
    search,
    onSearch,
    placeholder = 'Search...',
    inputId = 'search',
}: SidebarListSearchProps) {
    return (
        <div className={styles.searchInput}>
            <input
                type="text"
                name={inputId}
                id={inputId}
                placeholder={placeholder}
                value={search.query ?? ''}
                onChange={(event) =>
                    onSearch({
                        ...search,
                        query: event.currentTarget.value,
                        page: 0,
                    })
                }
            />
        </div>
    )
}

export interface SidebarListFooterProps {
    page?: number
    pageSize?: number
    count?: number
    isPending?: boolean
    onPageChange: (page: number) => void
}

export function SidebarListFooter({
    page = 0,
    pageSize = 25,
    count,
    isPending = false,
    onPageChange,
}: SidebarListFooterProps) {
    const [value, setValue] = useState('')

    const totalCount = count ?? 0
    const pageCount = Math.ceil(totalCount / pageSize)
    const canNavigate = pageCount > 1
    const maxPage = pageCount - 1

    const handleChangeValue = (nextValue: string) => {
        if (!nextValue || (/^\d+$/.test(nextValue) && nextValue.length < 10)) {
            setValue(nextValue)
        }
    }

    const handleSubmit = () => {
        const nextPage = +value - 1
        if (0 <= nextPage && nextPage <= maxPage) {
            onPageChange(nextPage)
        } else {
            setValue((page + 1).toString())
        }
    }

    useEffect(() => {
        setValue((page + 1).toString())
    }, [page])

    useEffect(() => {
        if (page < 0) onPageChange(0)
        else if (maxPage >= 0 && page > maxPage) onPageChange(maxPage)
    }, [page, maxPage, onPageChange])

    if (count == null) return null

    const startItem = page * pageSize + 1
    const endItem = Math.min((page + 1) * pageSize, totalCount)

    return (
        <div className={styles.pageSelectContainer}>
            <span className={styles.resultCount}>
                {totalCount === 0
                    ? 'No results'
                    : `Showing ${startItem}–${endItem} of ${totalCount.toLocaleString()} Results`}
            </span>
            <div className={styles.pageSelect}>
                <div className={styles.pageSelectButtons}>
                    <PaginationArrow
                        onClick={() => onPageChange(0)}
                        icon={FiChevronsLeft}
                        title="First"
                        enabled={canNavigate && page > 0}
                    />
                    <PaginationArrow
                        onClick={() => onPageChange(page - 1)}
                        icon={FiChevronLeft}
                        title="Previous"
                        enabled={canNavigate && page > 0}
                    />
                    <form
                        className={styles.pageSelectForm}
                        onSubmit={(event) => {
                            event.preventDefault()
                            handleSubmit()
                        }}
                    >
                        <input
                            id="page"
                            type="text"
                            value={value}
                            disabled={isPending}
                            onBlur={handleSubmit}
                            onChange={(event) =>
                                handleChangeValue(event.target.value)
                            }
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    event.currentTarget.blur()
                                }
                            }}
                            className={styles.pageSelectInput}
                        />
                        <input type="submit" hidden />
                        <span className={styles.pageSelectSpan}>
                            of{' '}
                            <span title={`${totalCount} total results`}>
                                {pageCount}
                            </span>
                        </span>
                    </form>
                    <PaginationArrow
                        onClick={() => onPageChange(page + 1)}
                        icon={FiChevronRight}
                        title="Next"
                        enabled={canNavigate && page < maxPage}
                    />
                    <PaginationArrow
                        onClick={() => onPageChange(maxPage)}
                        icon={FiChevronsRight}
                        title="Last"
                        enabled={canNavigate && page < maxPage}
                    />
                </div>
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
            className={`${styles.arrow} ${enabled ? styles.enabled : styles.disabled}`}
            onClick={() => enabled && onClick()}
            title={title}
        >
            <Icon size={20} />
        </a>
    )
}
