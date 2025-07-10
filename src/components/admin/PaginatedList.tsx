import { useQuery } from '@tanstack/react-query'
import { FC, useEffect, useState } from 'react'
import classNames from 'classnames'

import { FaChevronRight, FaChevronLeft } from 'react-icons/fa'

export interface PaginatedListProps<T extends object> {
    /**
     * The endpoint that will be used to fetch the data
     */
    api_endpoint: string

    /**
     * Called when an element in the list is selected by the user. The handler can
     * return false to disallow the selection (like if there are edits in progress
     * for example)
     */
    before_element_selection?: (value: T) => boolean
    /**
     * Called after an element is selected from the list
     */
    on_element_selected: (value: T) => void

    id_key: keyof T
    display_key: keyof T
}

export interface PaginatedResponse<T> {
    page: number
    limit: number
    pages: number
    count: number
    data: T[]
}

export default function PaginatedList<T extends object>(
    props: PaginatedListProps<T>
) {
    const [page, setPage] = useState(0)
    const [pages, setPages] = useState(1)
    const [limit, setLimit] = useState(4)
    const [selected_id, set_selected_id] = useState<string | null>(null)

    const { isPending, isSuccess, error, data } = useQuery<
        PaginatedResponse<T>
    >({
        queryKey: [props.api_endpoint, page, pages, limit],
        queryFn: async () => {
            const url = new URL(location.href)
            url.pathname = props.api_endpoint
            url.searchParams.set('page', page + '')
            url.searchParams.set('limit', limit + '')

            console.log(url)

            const res = await fetch(url)
            return await res.json()
        },
    })

    useEffect(() => {
        if (isSuccess) {
            setPage(data?.page)
            setLimit(data?.limit)
            setPages(data?.pages)
        }
    }, [isSuccess])

    const handleClick = (clicked_id: string) => {
        const selected = data?.data.find((e) => e[props.id_key] === selected_id)
        const item = data?.data.find((e) => e[props.id_key] === clicked_id)

        if (!item || selected === item) return

        if (
            props.before_element_selection &&
            !props.before_element_selection(item)
        )
            return

        set_selected_id(clicked_id)
    }

    return (
        <div>
            <div className="flex bg-white p-4">
                <input
                    type="text"
                    name=""
                    id=""
                    className="w-full rounded-lg border-2 border-black px-2"
                    placeholder="Search..."
                />
            </div>

            {isPending && <div>Pending</div>}
            {error && <div>Error: {error.message}</div>}
            {data && (
                <ul>
                    {data.data.map((e) => (
                        <li
                            key={e[props.id_key] as string}
                            className={classNames('p-4 hover:bg-blue-400', {
                                'bg-white': selected_id !== e[props.id_key],
                                'bg-blue-500': selected_id === e[props.id_key],
                            })}
                            onClick={() =>
                                handleClick(e[props.id_key] as string)
                            }
                        >
                            {e[props.display_key] as string}
                        </li>
                    ))}
                </ul>
            )}
            <div className="flex gap-4">
                <Pagination
                    page={page}
                    maxPage={pages - 1}
                    onPageChange={setPage}
                />
            </div>
        </div>
    )
}

const Pagination: FC<{
    page: number
    onPageChange: (page: number) => void
    maxPage: number
}> = ({ page, onPageChange, maxPage }) => {
    let enabled = maxPage > 1

    let components = []

    components.push(
        <PaginationArrow
            key={0}
            direction="left"
            onClick={() => onPageChange(page - 1)}
            enabled={enabled && page > 1}
        />
    )

    // If there are less than 7 pages, show all pages
    if (maxPage <= 5) {
        for (let i = 1; i <= maxPage; i++) {
            components.push(
                <PageNumber
                    key={i}
                    page={i}
                    active={i === page}
                    onClick={() => onPageChange(i)}
                />
            )
        }
    }
    // Display first few, ... and last number
    // <- 1 [2] 3 4 5 ... 9 ->
    else if (page <= 3) {
        for (let i = 1; i <= 5; i++) {
            components.push(
                <PageNumber
                    key={i}
                    page={i}
                    active={i === page}
                    onClick={() => onPageChange(i)}
                />
            )
        }
        components.push(<Ellipses key={6} />)
        components.push(
            <PageNumber
                key={7}
                page={maxPage}
                active={maxPage === page}
                onClick={() => onPageChange(maxPage)}
            />
        )
    }
    // display first number, ... and last few
    // <- 1 ... 8 [9] 10 ->
    else if (maxPage - page <= 3) {
        components.push(
            <PageNumber
                key={1}
                page={1}
                active={1 === page}
                onClick={() => onPageChange(1)}
            />
        )
        components.push(<Ellipses key={2} />)
        for (let i = maxPage - 4; i <= maxPage; i++) {
            components.push(
                <PageNumber
                    key={i}
                    page={i}
                    active={i === page}
                    onClick={() => onPageChange(i)}
                />
            )
        }
    }
    // display first, ..., middle (selected is dead middle), ..., and last
    // <- 1 ... 7 [8] 9 ... 12 ->
    else {
        components.push(
            <PageNumber
                key={1}
                page={1}
                active={1 === page}
                onClick={() => onPageChange(1)}
            />
        )
        components.push(<Ellipses key={2} />)
        for (let i = page - 1; i <= page + 1; i++) {
            components.push(
                <PageNumber
                    key={i}
                    page={i}
                    active={i === page}
                    onClick={() => onPageChange(i)}
                />
            )
        }
        components.push(<Ellipses key={maxPage - 1} />)
        components.push(
            <PageNumber
                key={maxPage}
                page={maxPage}
                active={1 === page}
                onClick={() => onPageChange(1)}
            />
        )
    }

    components.push(
        <PaginationArrow
            key={maxPage + 1}
            direction="right"
            onClick={() => onPageChange(page + 1)}
            enabled={enabled && page < maxPage}
        />
    )

    return (
        <div className="flex w-full items-center justify-center gap-3 bg-white p-4">
            {components}
        </div>
    )
}

const PageNumber: FC<{
    page: number
    active: boolean
    onClick: () => void
}> = ({ page, active, onClick }) => {
    return (
        <a
            className={classNames(
                'flex h-8 w-8 cursor-pointer select-none items-center justify-center text-center font-bold',
                {
                    'text-red-500 underline': active,

                    'text-gray-700': !active,
                }
            )}
            onClick={onClick}
        >
            {page}
        </a>
    )
}

const PaginationArrow: FC<{
    direction: 'left' | 'right'
    onClick: () => void
    enabled: boolean
}> = ({ direction, onClick, enabled }) => {
    return (
        <a
            className={classNames(
                'flex cursor-pointer select-none items-center justify-center font-semibold',
                {
                    'text-gray-700': enabled,
                    'text-gray-300 cursor-not-allowed': !enabled,
                }
            )}
            onClick={() => enabled && onClick()}
        >
            {direction === 'left' ? <FaChevronLeft /> : <FaChevronRight />}
        </a>
    )
}

const Ellipses: FC = () => {
    return (
        <div className="flex h-8 w-8 select-none items-center justify-center font-semibold text-red-500">
            ...
        </div>
    )
}
