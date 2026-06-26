'use client'

/*
 * List.Filters — search-field / sort / limit / custom multi-select filters for a
 * sidebar list. Ported from panel/sidebar_list `SidebarListFilters`. Every
 * change resets page to 0.
 */
import styles from './list.module.css'
import { MultiSelect, type MultiSelectOption } from '@/components/common'
import { type SearchRequest, SortDirection } from '@/contracts/requests'
import type { ReactElement } from 'react'

export interface ListFilterOption {
    value: string
    label: string
    options: MultiSelectOption[]
}

export interface ListFieldOption {
    value: string
    label: string
}

export interface ListFiltersProps {
    search: SearchRequest
    onSearch: (search: SearchRequest) => void
    options?: ListFilterOption[]
    searchFieldOptions?: ListFieldOption[]
    sortFieldOptions?: ListFieldOption[]
    showLimit?: boolean
    showSort?: boolean
    limitOptions?: number[]
}

export function ListFilters({
    search,
    onSearch,
    options = [],
    searchFieldOptions,
    sortFieldOptions,
    showLimit = true,
    showSort = true,
    limitOptions = [5, 10, 25, 50, 100],
}: ListFiltersProps): ReactElement {
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
