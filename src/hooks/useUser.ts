import { useFetch } from './useFetch'
import { IUser } from '@/models/User'
import { useQuery } from '@tanstack/react-query'

/**
 * @param {boolean} lazy - Don't load the user until you explicitly call `refetch`
 */
export function useUser(lazy?: boolean) {
    const { onGet } = useFetch()

    const { isLoading, error, data, refetch } = useQuery({
        queryKey: ['/api/users/current'],
        queryFn: async ({ signal }) =>
            await onGet<IUser>('/users/current', signal),
        enabled: !lazy,
    })

    return { data, isLoading, error, refetch }
}

/**
 * Given a "User", checks throughout the user's roles to see if any contain the specified permission.
 * @param {IUser} user - `data` from the `useUser` hook
 * @param {string} permission - Name of the permission
 */
export function hasPermission(user: IUser, permission: string): boolean {
    return (
        user.roles?.some((r) =>
            r.permissions?.some((p) => p.name == permission)
        ) ?? false
    )
}
