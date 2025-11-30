import { useFetch } from './useFetch'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { UpdateUserRequest, User, zUser } from '~/models'

/**
 * @param lazy - Don't load the user until you explicitly call `refetch`
 */
export function useUser(lazy?: boolean) {
    const queryClient = useQueryClient()
    const { onGet, onPatch } = useFetch()

    const { isLoading, error, data, refetch } = useQuery({
        queryKey: ['/users/current'],
        queryFn: async ({ signal }) =>
            await onGet<User>('/users/current', zUser, signal),
        enabled: !lazy,
    })

    const { mutate } = useMutation({
        mutationFn: async (req: UpdateUserRequest) => {
            if (!data?.id) return
            const user = await onPatch<User>(`/users/${data.id}`, req, zUser)
            queryClient.setQueryData(['user'], () => user)
        },
    })

    return { data, isLoading, error, onFetch: refetch, onUpdate: mutate }
}

/**
 * Given a "User", checks throughout the user's roles to see if any contain the specified permission.
 * @param user - `data` from the `useUser` hook
 * @param permission - Name of the permission
 */
export function hasPermission(user: User, permission: string): boolean {
    return (
        user.roles?.some((r) =>
            r.permissions?.some((p) => p.name == permission)
        ) ?? false
    )
}
