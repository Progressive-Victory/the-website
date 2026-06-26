'use client'

/*
 * List.Search — text search input for a sidebar list.
 * Ported from panel/sidebar_list `SidebarListSearch`. Resets page to 0 on input.
 */
import styles from './list.module.css'
import type { SearchRequest } from '@/contracts/requests'
import type { ReactElement } from 'react'

export interface ListSearchProps {
    search: SearchRequest
    onSearch: (search: SearchRequest) => void
    placeholder?: string
    inputId?: string
}

export function ListSearch({
    search,
    onSearch,
    placeholder = 'Search...',
    inputId = 'search',
}: ListSearchProps): ReactElement {
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
