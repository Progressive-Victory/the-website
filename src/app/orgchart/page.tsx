'use client'

import OrgChartApp from './app'
import styles from './page.module.css'
import { HalftoneBackground } from '@/components/halftone/HalftoneBackground'
import { MainLayout } from '@/components/layout'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useState } from 'react'

export interface PaginatedResponse<T> {
    //This is just a test.
    data: T[]
}

export default function OrgChart<T extends object>() {
    const [page, setPage] = useState(0)
    const [pages, setPages] = useState(1)
    const [limit, setLimit] = useState(50)

    /*const { data } = useQuery<PaginatedResponse<T>>({
        queryKey: ['users'],
        queryFn: async ({ signal }) => {
            const url = new URL(location.href)
            url.pathname = 'api/admin/users'

            url.searchParams.set('page', page + '')
            url.searchParams.set('limit', limit + '')

            const res = await fetch(url, { signal })
            return (await res.json()) as PaginatedResponse<T>
        },
        placeholderData: keepPreviousData,
    })

    console.log(data)

    const filteredData = data?.data.filter((e) => e.userPositions.length > 0)
    console.log(filteredData)

    console.log(data?.data)*/

    /*
    - Current roles
      - Top Director
      - Deputy Director A
      - Deputy Director B
      - State Lead A
    */

    return (
        <MainLayout>
            <HalftoneBackground />
            <div className={styles.backdrop} />
            <div className={styles.container}>
                <header className={styles.header}>
                    {'Organization '}
                    <span style={{ color: '#09223a' }}>{'Chart'}</span>
                </header>
                <div className={styles.appContainer}>
                    <OrgChartApp />
                </div>
            </div>
        </MainLayout>
    )
}
