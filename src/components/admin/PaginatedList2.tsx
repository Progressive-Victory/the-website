import styles from './PaginatedList.module.css'
import { SearchRequest } from '@/contracts/requests'
import cx from 'classnames'
import { ReactElement, useEffect, useState } from 'react'
import {
    FiChevronLeft,
    FiChevronRight,
    FiChevronsLeft,
    FiChevronsRight,
} from 'react-icons/fi'
import { IconType } from 'react-icons/lib'

export interface PaginatedListProps {
    search: SearchRequest

    count: number | null
    isPending: boolean
    error: Error | null

    children?: ReactElement<ListElementProps>[]

    onSearch: (search: SearchRequest) => void
}

export function PaginatedList({
    search,
    count,
    isPending,
    error,
    children,
    onSearch,
}: PaginatedListProps) {
    const page = search.page ?? 0
    const limit = search.limit ?? 25

    const handleChangePage = (page: number) => {
        onSearch({ ...search, page })
    }

    return (
        <div className={styles.list}>
            <div className={styles.listStatus}>
                {isPending ? (
                    <span color="#9ca3af">Loading...</span>
                ) : error ? (
                    <span color="#ef4444">Error: {error.message}</span>
                ) : !count && (
                    <span>No results found</span>
                )}
            </div>

            <ul className={styles.elementList}>{children}</ul>

            {count != null && (
                <div className={styles.pageSelectContainer}>
                    <PageSelect
                        page={page}
                        pageSize={limit}
                        count={count}
                        disabled={isPending}
                        onChange={handleChangePage}
                    />
                </div>
            )}
        </div>
    )
}

export interface ListElementProps {
    selected: boolean
    className?: string
    children: React.ReactNode
    onClick: () => void
}

export function ListElement({
    selected,
    children,
    className,
    onClick,
}: ListElementProps) {
    return (
        <li className={className} onClick={onClick}>
            <div className={cx(styles.element, selected && styles.selected)}>
                {children}
            </div>
        </li>
    )
}

interface PageSelectProps {
    page: number
    count: number
    pageSize: number
    disabled?: boolean
    onChange: (page: number) => void
}

function PageSelect({
    page,
    count,
    pageSize,
    disabled,
    onChange,
}: PageSelectProps) {
    const [value, setValue] = useState('')

    const pageCount = Math.ceil(count / pageSize)
    const canNavigate = pageCount > 1
    const maxPage = pageCount - 1

    const handleChangeValue = (value: string) => {
        if (!value || (/^\d+$/.test(value) && value.length < 10))
            setValue(value)
    }

    const handleSubmit = () => {
        const newPage = +value - 1 || page
        if (0 <= newPage && newPage <= maxPage) onChange(newPage)
        else setValue((page + 1).toString())
    }

    useEffect(() => {
        setValue((page + 1).toString())
    }, [page])

    return (
        <div className={styles.pageSelect}>
            <div className={styles.pageSelectButtons}>
                <PaginationArrow
                    onClick={() => onChange(0)}
                    icon={FiChevronsLeft}
                    title="First"
                    enabled={canNavigate && page > 0}
                />
                <PaginationArrow
                    onClick={() => onChange(page - 1)}
                    icon={FiChevronLeft}
                    title="Previous"
                    enabled={canNavigate && page > 0}
                />
                <form
                    className={styles.pageSelectForm}
                    onSubmit={(e) => {
                        e.preventDefault()
                        handleSubmit()
                    }}
                >
                    <input
                        type="text"
                        value={value}
                        disabled={disabled}
                        onBlur={handleSubmit}
                        onChange={(e) => handleChangeValue(e.target.value)}
                        className={styles.pageSelectInput}
                    />
                    <input type="submit" hidden />
                    <span className={styles.pageSelectSpan} color="#4b5563">
                        of{' '}
                        <span title={`${count} total results`}>
                            {pageCount}
                        </span>
                    </span>
                </form>
                <PaginationArrow
                    onClick={() => onChange(page + 1)}
                    icon={FiChevronRight}
                    title="Next"
                    enabled={canNavigate && page < maxPage}
                />
                <PaginationArrow
                    onClick={() => onChange(maxPage)}
                    icon={FiChevronsRight}
                    title="Last"
                    enabled={canNavigate && page < maxPage}
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
            className={cx(
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
