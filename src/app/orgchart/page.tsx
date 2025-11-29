'use client'

import { MainLayout } from '@/components/layout'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import OrgChartApp from './app'


export interface PaginatedResponse<T> {
    //This is just a test.
    data: T[]
}
const departments = [
    'Community',
    'Media',
    'Operations',
    'Infrastructure',
    'Organizing',
    'Technology',
]

const teams = [
    'Welcome Team',
    'Events Team',
    'Moderation Team',
    'Writing Team',
    'Audio-Video Team',
    'Design Team',
    'Fundraising Team',
    'Documentation Team',
    'Research Team',
    'Recruitment Team',
    'Mobilization Team',
]

const coalitions = [
    'Eastern Coalition',
    'Midwest Coalition',
    'Northeastern Coalition',
    'Southern Coalition',
]

const state_teams = ['Western', 'Midwest', 'Northeast', 'Southern']

const senior_roles = ['Top Director']

export default function OrgChart<T extends object>() {
    /*const [page, setPage] = useState(0)
    const [pages, setPages] = useState(1)
    const [limit, setLimit] = useState(25)

    const { data } = useQuery<PaginatedResponse<T>>({
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

    console.log(data?.data)

    const topDirector = () => {
        const filteredData = data?.data.filter(
            (e) => e.userPositions.length > 0
        )

        if (filteredData) {
            const topDirector = filteredData.find((e) => {
                return e?.userPositions.find(
                    (el) => el.positionName === 'Top Director'
                )
            })
            const topDirectorIndex = filteredData.findIndex((e) =>
                e?.userPositions.find(
                    (el) => el.positionName === 'Top Director'
                )
            )
            console.log(topDirector)
            console.log(topDirectorIndex)
        }
    }

    topDirector()*/

    /*
    const DeputyDirectors = () => {

    }
    */

    /*
    - Current roles
      - Top Director
      - Deputy Director A
      - Deputy Director B
      - State Lead A
    */

    /*
    - I need to place Top Director on top, before the list of departments.
    - I need to create an array of department directors to be rendered and placed immediately below the list of departments.
    - The remainder is in an array of users whose relationship to directors and departments must be determined.
    */

    /*
    - Idea #1 - Try to split Top Director and Deputy Director roles separately from State Lead in the JSX code itself.
    - Idea #2 - Try to split these into separate arrays before the JSX code.
    */

    /*
      - IDEA - Create a function to filter out users by parameters like department name and team name (possibly using includes)
      - Figure out who are diectors and so on
    */

    //const filteredData = data?.data.filter((e) => (e.userPositions.length > 0 && e.userPositions.positionName === "Top Director"))

    return (
        <MainLayout>
            {/* Halftone background */}
            {
                /*
            <div className="halftone z-1 absolute inset-0 size-full opacity-10" />
            <div className="z-2 relative m-auto flex min-h-screen w-full flex-col items-center justify-start gap-y-10 pb-16 pt-10 xl:min-h-[unset]">
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
            */
        }

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
