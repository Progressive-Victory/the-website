'use client'

import { MainLayout } from '@/components/layout'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import DepartmentBubble from './department'
import PositionBubble from './position'
import TeamBubble from './team'

export interface PaginatedResponse<T> {
    //This is just a test.
    data: T[]
}

export default function OrgChart<T extends object>() {
    const [page, setPage] = useState(0)
    const [pages, setPages] = useState(1)
    const [limit, setLimit] = useState(25)
    /*
    const searchParams = useDebounce(
        [
            page,
            pages,
            limit,
            searchQuery,
            searchField,
            searchFilters,
            sortOrder,
        ],
        50
    )
    */

    const { data } = useQuery<PaginatedResponse<T>>({
        queryKey: ['users'],
        queryFn: async ({ signal }) => {
            const url = new URL(location.href)
            url.pathname = 'api/admin/users'
            console.log(url.pathname)
            url.searchParams.set('page', page + '')
            url.searchParams.set('limit', limit + '')

            const res = await fetch(url, { signal })
            return (await res.json()) as PaginatedResponse<T>
        },
        placeholderData: keepPreviousData,
    })

    console.log(data)

    async function test() {
        const filteredData = data?.data.filter((e) => e.userPositions)

        console.log(filteredData)

        if (filteredData) {
            console.log(filteredData)
            const userPositions = filteredData[0].userPositions
            console.log(userPositions[0])
            const url = new URL(location.href)
            url.pathname = `api/admin/positions/${userPositions[0]}`
            const res = await fetch(url)

            const data = await res.json()

            console.log(data)

            //retrievePosition(userPositions[0])
        }
    }
    test()

    return (
        <MainLayout>
            {/* Halftone background */}
            <div className="halftone z-1 absolute inset-0 size-full opacity-10" />
            <div className="z-2 relative m-auto flex min-h-screen w-full flex-col items-center justify-start gap-y-10 pb-16 pt-10 xl:min-h-[unset]">
                {/* Content Here: Only Doing some bubble tests for now! */}
                <p className="w-full text-center text-4xl font-bold text-white">
                    Organization{' '}
                    <span className="text-black-pearl-dark">Chart</span>
                </p>
                <div className="w-full overflow-auto bg-white">
                    <DepartmentBubble name="Engineering" />
                    <PositionBubble
                        title="Deputy Tech Director"
                        name="Joops"
                        leadership="Senior"
                    />
                    <PositionBubble
                        title="Website Eng. Team Lead"
                        committees={['Engineering Committee']}
                    />
                    <TeamBubble
                        name="Welcome Team"
                        description="Welcome team guarantees that all new members of 
						PV recieve a friendly face to guide them through the process 
						of joining the org. They help inform new members of how to 
						get started in the org and direct them to areas of interest 
						such as upcoming events, state teams, department teams, and 
						more."
                    />
                </div>
            </div>
        </MainLayout>
    )
}
