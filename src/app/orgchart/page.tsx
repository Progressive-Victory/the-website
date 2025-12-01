'use client'

import { MainLayout } from '@/components/layout'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import OrgChartApp from './app'


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
            {/* Halftone background */}
            <div className="halftone z-1 absolute inset-0 size-full opacity-10" />
            <div className="z-2 relative m-auto flex min-h-screen w-full flex-col items-center justify-start gap-y-10 pb-16 pt-10 xl:min-h-[unset]">
                <header className="w-full text-center text-4xl font-bold text-white">
                    {'Organization '}
                    <span className="text-black-pearl-dark">{'Chart'}</span>
                </header>
                <div className="h-[75vh] w-[97vw] overflow-auto rounded-lg bg-black-pearl-dark p-2">
                    <OrgChartApp />
                </div>
            </div>
        </MainLayout>
    )
}
