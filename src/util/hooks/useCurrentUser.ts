import { useFetch } from './useFetch'
import { User, zUser } from '@/contracts/data'
import {
    keepPreviousData,
    skipToken,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query'

export function useCurrentUser() {
    const queryClient = useQueryClient()
    const { ready, onGet } = useFetch()

    const user = useQuery({
        queryKey: ['/users/current'],
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

    const handleInvalidate = async () => {
        await queryClient.invalidateQueries({ queryKey: ['/users/current'] })
    }

    return {
        data: user.data,
        isLoading: user.isLoading,
        error: user.error?.message ?? null,
        onRefetch: handleRefetch,
        onInvalidate: handleInvalidate,
    }
}

export function hasPermission(user: User, permission: string): boolean {
    return (
        user.roles?.some((r) =>
            r.permissions?.some((p) => p.name == permission)
        ) ?? false
    )
}
