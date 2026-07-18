'use client'

import styles from './page.module.css'
import { ListElement, List } from '@/app/admin/layout/List'
import { Position } from '@/contracts/data'
import { usePositionQueries } from '@/queries'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

export default function Page() {
    const queryClient = useQueryClient()
    const positionQueries = usePositionQueries()

    const [selectedPosition, setSelectedPosition] = useState<Position | null>(
        null
    )

    // const eventQuery = useQuery({
    //     queryKey: [`/events/${selectedId}`],
    //     queryFn:
    //         ready && selectedId != null ?
    //             ({ signal }) =>

    // })

    return (
        <>
            <h1>Events</h1>
            {/* <List
                search={search}
                count={searchQuery.data?.count}
                isPending={searchQuery.isPending}
                error={searchQuery.error}
                onSearch={handleSearch}
            >
                {searchQuery.data?.data?.map(e => renderItem(i))}
            <List> */}
        </>
    )
}
