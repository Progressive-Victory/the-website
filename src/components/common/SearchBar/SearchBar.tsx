'use client'

import { CloseCircleIcon } from '../icons/CloseCircleIcon'
import styles from './SearchBar.module.css'
import { cn } from '@/util'
import type { InputHTMLAttributes, ReactNode } from 'react'
import { FiSearch } from 'react-icons/fi'

export interface SearchBarProps extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'type' | 'value'
> {
    value: string
    searchbarStyle?: 'pill' | 'rounded'
    resultCount?: number
    settingsDropdownButton?: ReactNode
    onClear: () => void
}

export function SearchBar({
    value,
    searchbarStyle = 'pill',
    resultCount,
    settingsDropdownButton,
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
                settingsDropdownButton && (
                    <span className={styles.settingsButton}>
                        {settingsDropdownButton}
                    </span>
                )
            )}
        </div>
    )
}
