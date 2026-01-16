import { useFetch } from './useFetch'
import { IUser, zUser } from '@/contracts/data'
import { keepPreviousData, useQuery } from '@tanstack/react-query'

interface DataState {
    data: IUser | undefined
    isLoading: boolean
    error: string | null
    onRefetch: () => Promise<IUser | undefined>
}

export function useCurrentUser(): DataState {
    const { onGet } = useFetch()

    const user = useQuery({
        queryKey: ['/users/current'],
        queryFn({ signal }) {
            return onGet<IUser>('/users/current', zUser, { signal })
        },
        placeholderData: keepPreviousData,
    })

    const handleRefetch = async () => {
        const res = await user.refetch()
        return res.data
    }

    return {
        data: user.data,
        isLoading: user.isLoading,
        error: user.error?.message ?? null,
        onRefetch: handleRefetch,
    }
}

export function hasPermission(user: IUser, permission: string): boolean {
    return (
        user.roles?.some((r) =>
            r.permissions?.some((p) => p.name == permission)
        ) ?? false
    )
}
