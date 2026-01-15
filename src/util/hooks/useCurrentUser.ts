import { useFetch } from './useFetch'
import { IUser, zUser } from '@/models'
import { keepPreviousData, useQuery } from '@tanstack/react-query'

interface DataState {
    data: IUser | undefined
    loading: boolean
    error: string | null
    reload: () => void
}

export function useCurrentUser(): DataState {
    const { onGet } = useFetch()

    const { isPending, data, error, refetch } = useQuery({
        queryKey: ['/users/current'],
        queryFn({ signal }) {
            return onGet<IUser>('/users/current', zUser, undefined, signal)
        },
        placeholderData: keepPreviousData,
    })

    //.log(data, isPending, error)

    return {
        data,
        loading: isPending,
        error: error?.message ?? null,
        reload: () => void refetch(),
    }
}

export function hasPermission(user: IUser, permission: string): boolean {
    return (
        user.roles?.some((r) =>
            r.permissions?.some((p) => p.name == permission)
        ) ?? false
    )
}
