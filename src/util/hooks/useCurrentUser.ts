import { useFetch } from './useFetch'
import { User, zUser } from '@/models/users'
import { keepPreviousData, useQuery } from '@tanstack/react-query'

interface DataState {
    data: User | undefined
    loading: boolean
    error: string | null
    reload: () => void
}

export function useCurrentUser(): DataState {
    const { onGet } = useFetch()

    const { isPending, data, error, refetch } = useQuery({
        queryKey: ['/users/current'],
        queryFn({ signal }) {
            return onGet<User>('/users/current', zUser, signal)
        },
        placeholderData: keepPreviousData,
    })

    console.log(data, isPending, error)

    return {
        data,
        loading: isPending,
        error: error?.message ?? null,
        reload: () => void refetch(),
    }
}

export function hasPermission(user: User, permission: string): boolean {
    return (
        user.roles?.some((r) =>
            r.permissions?.some((p) => p.name == permission)
        ) ?? false
    )
}
