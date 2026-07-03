import { useFetch } from './useFetch'
import { User, zUser } from '@/contracts/data'
import { keepPreviousData, skipToken, useQuery } from '@tanstack/react-query'

interface DataState {
    data: User | undefined
    isLoading: boolean
    error: string | null
    onRefetch: () => Promise<User | undefined>
}

export function useCurrentUser(): DataState {
    const { ready, onGet } = useFetch()

    const user = useQuery({
        queryKey: ['/users/current?includeDonors=true'],
        queryFn: ready
            ? ({ signal }) =>
                  onGet('/users/current', zUser, {
                      query: {
                          includeDiscordUsers: true,
                          includeDonors: true,
                      },
                      signal,
                  })
            : skipToken,
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

export function hasPermission(user: User, permission: string): boolean {
    return (
        user.roles?.some((r) =>
            r.permissions?.some((p) => p.name == permission)
        ) ?? false
    )
}
