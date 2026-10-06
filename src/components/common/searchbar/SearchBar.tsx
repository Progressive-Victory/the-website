'use client'

import { DropdownButton } from '../dropdown/DropdownButton'
import { DropdownOverlay } from '../dropdown/DropdownOverlay'
import { CloseCircleIcon } from '../icons/CloseCircleIcon'
import styles from './SearchBar.module.css'
import { cn } from '@/util'
import type { InputHTMLAttributes, ReactNode } from 'react'
import { FiSearch } from 'react-icons/fi'
import { IoMdOptions } from 'react-icons/io'

export type SearchBarFilterContent =
    ReactNode | ((controls: { close: () => void }) => ReactNode)

export interface SearchBarProps extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'type' | 'value'
> {
    value: string
    searchbarStyle?: 'pill' | 'rounded'
    resultCount?: number
    filterContent?: SearchBarFilterContent
    filterLabel?: string

    onClear: () => void
}

export function SearchBar({
    value,
    searchbarStyle = 'pill',
    resultCount,
    filterContent,
    filterLabel = 'Show Filters',
    onClear,
    className,
    ...inputProps
}: SearchBarProps) {
    const hasSearch = value.trim() !== ''

    return (
        <div
            className={cn(
                styles.searchBar,
                resultCount != null && styles.withResultCount
            )}
        >
            <FiSearch className={styles.searchIcon} aria-hidden="true" />

            <input
                {...inputProps}
                type="search"
                className={cn(
                    styles.searchInput,
                    styles[searchbarStyle],
                    className
                )}
                value={value}
            />

            {hasSearch && resultCount != null && (
                <span className={styles.resultCount}>
                    {resultCount.toLocaleString()}
                </span>
            )}

            {hasSearch ? (
                <button
                    type="button"
                    className={styles.clearButton}
                    aria-label="Clear search"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={onClear}
                >
                    <CloseCircleIcon />
                </button>
            ) : (
                filterContent && (
                    <span className={styles.settingsButton}>
                        <DropdownButton
                            type="button"
                            buttonVariant="plain"
                            aria-label={filterLabel}
                            title={filterLabel}
                            menu={({ closeDropdown }) => (
                                <DropdownOverlay
                                    body={
                                        typeof filterContent === 'function'
                                            ? filterContent({
                                                  close: closeDropdown,
                                              })
                                            : filterContent
                                    }
                                    onClose={closeDropdown}
                                />
                            )}
                        >
                            <IoMdOptions aria-hidden="true" />
                        </DropdownButton>
                    </span>
                )
            )}
        </div>
    )
}
