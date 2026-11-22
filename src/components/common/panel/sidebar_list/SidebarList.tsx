import styles from './SidebarList.module.css'
import {
    DropdownOverlayButton,
    SearchBar,
    type MultiSelectOption,
    type SearchBarFilterContent,
} from '@/components/common'
import { cn } from '@/util'
import { type SearchRequest, SortDirection } from 'pv-contracts/requests'
import { useEffect, useState, type ReactNode } from 'react'
import {
    FaArrowDownWideShort,
    FaArrowsUpDown,
    FaFilter,
    FaListUl,
    FaMagnifyingGlass,
} from 'react-icons/fa6'
import {
    FiChevronLeft,
    FiChevronRight,
    FiChevronsLeft,
    FiChevronsRight,
} from 'react-icons/fi'
import type { IconType } from 'react-icons/lib'

export * from './SidebarBody'

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
        <div className={styles.filterMenu}>
            {!!searchFieldOptions?.length && (
                <FilterSubmenu
                    label="Search"
                    icon={<FaMagnifyingGlass />}
                    active={false}
                    valueSet={searchField != null}
                    items={searchFieldOptions.map((option) => ({
                        key: option.value,
                        label: option.label,
                        checked: searchField === option.value,
                        clearable: true,
                        onSelect: () =>
                            handleChangeSearchField(
                                searchField === option.value
                                    ? undefined
                                    : option.value
                            ),
                    }))}
                />
            )}

            {!!sortFieldOptions?.length && (
                <FilterSubmenu
                    label="Sort"
                    icon={<FaArrowDownWideShort />}
                    active={false}
                    valueSet={sortField != null}
                    items={sortFieldOptions.map((option) => ({
                        key: option.value,
                        label: option.label,
                        checked: sortField === option.value,
                        clearable: true,
                        onSelect: () =>
                            handleChangeSortField(
                                sortField === option.value
                                    ? undefined
                                    : option.value
                            ),
                    }))}
                />
            )}

            {showSort && (
                <FilterSubmenu
                    label={
                        sort === SortDirection.ASC ? 'Ascending' : 'Descending'
                    }
                    icon={<FaArrowsUpDown />}
                    active={false}
                    items={[
                        { direction: SortDirection.ASC, label: 'Ascending' },
                        { direction: SortDirection.DESC, label: 'Descending' },
                    ].map(({ direction, label }) => ({
                        key: direction,
                        label,
                        checked: (sort ?? SortDirection.DESC) === direction,
                        onSelect: () => handleChangeSort(direction),
                    }))}
                />
            )}

            {showLimit && (
                <FilterSubmenu
                    label={`${limit ?? 25} per page`}
                    icon={<FaListUl />}
                    active={false}
                    items={limitOptions.map((option) => ({
                        key: String(option),
                        label: `${option} per page`,
                        checked: (limit ?? 25) === option,
                        onSelect: () => handleChangeLimit(option),
                    }))}
                />
            )}

            {options.map((option) => {
                const selected =
                    ((activeFilters as Record<string, unknown>)[
                        option.value
                    ] as (string | number)[] | undefined) ?? []

                return (
                    <FilterSubmenu
                        key={option.value}
                        label={option.label}
                        icon={<FaFilter />}
                        active={selected.length > 0}
                        keepOpen
                        items={option.options.map((item) => ({
                            key: String(item.value),
                            label: item.label,
                            checked: selected.includes(item.value),
                            onSelect: () =>
                                handleChangeFilter(
                                    option.value,
                                    selected.includes(item.value)
                                        ? selected.filter(
                                              (value) => value !== item.value
                                          )
                                        : [...selected, item.value]
                                ),
                        }))}
                    />
                )
            })}
        </div>
    )
}

interface FilterSubmenuItem {
    key: string
    label: ReactNode
    checked: boolean
    clearable?: boolean
    onSelect: () => void
}

function FilterSubmenu({
    label,
    icon,
    active,
    items,
    keepOpen = false,
    valueSet = false,
}: {
    label: ReactNode
    icon: ReactNode
    active: boolean
    items: FilterSubmenuItem[]
    keepOpen?: boolean
    valueSet?: boolean
}) {
    return (
        <DropdownOverlayButton
            icon={icon}
            selected={active}
            className={cn(valueSet && styles.filterValueSet)}
            menu={({ closeMenu }) => (
                <div className={styles.filterMenu}>
                    {items.map((item) => (
                        <DropdownOverlayButton
                            key={item.key}
                            checked={item.checked}
                            clearable={item.clearable}
                            onCheckedChange={() => {
                                item.onSelect()
                                if (!keepOpen) closeMenu()
                            }}
                        >
                            {item.label}
                        </DropdownOverlayButton>
                    ))}
                </div>
            )}
        >
            {label}
        </DropdownOverlayButton>
    )
}

export interface SidebarListSearchProps {
    search: SearchRequest
    onSearch: (search: SearchRequest) => void
    placeholder?: string
    inputId?: string
    resultCount?: number
    filterContent?: SearchBarFilterContent
}

export function SidebarListSearch({
    search,
    onSearch,
    placeholder = 'Search...',
    inputId = 'search',
    resultCount,
    filterContent,
}: SidebarListSearchProps) {
    const updateQuery = (query: string) =>
        onSearch({
            ...search,
            query,
            page: 0,
        })
    return (
        <div className={styles.searchInput}>
            <SearchBar
                name={inputId}
                id={inputId}
                placeholder={placeholder}
                aria-label={placeholder}
                searchbarStyle="rounded"
                value={search.query ?? ''}
                resultCount={resultCount}
                filterContent={filterContent}
                className={styles.sidebarSearchInput}
                onChange={(event) => updateQuery(event.currentTarget.value)}
                onClear={() => updateQuery('')}
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
            className={cn(
                styles.arrow,
                enabled ? styles.enabled : styles.disabled
            )}
            onClick={() => enabled && onClick()}
            title={title}
        >
            <Icon size={20} />
        </a>
    )
}
