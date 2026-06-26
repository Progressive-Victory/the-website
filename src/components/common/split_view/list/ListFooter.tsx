'use client'

/*
 * List.Footer — pagination control for a sidebar list.
 * Ported from panel/sidebar_list `SidebarListFooter`. Returns null until a
 * count is known. Clamps the page into range and supports direct page entry.
 */
import styles from './list.module.css'
import { useEffect, useState } from 'react'
import type { ReactElement } from 'react'
import {
    FiChevronLeft,
    FiChevronRight,
    FiChevronsLeft,
    FiChevronsRight,
} from 'react-icons/fi'
import type { IconType } from 'react-icons/lib'

export interface ListFooterProps {
    page?: number
    pageSize?: number
    count?: number
    isPending?: boolean
    onPageChange: (page: number) => void
}

export function ListFooter({
    page = 0,
    pageSize = 25,
    count,
    isPending = false,
    onPageChange,
}: ListFooterProps): ReactElement | null {
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

    return (
        <div className={styles.pageSelectContainer}>
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
}: PaginationArrowProps): ReactElement {
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
