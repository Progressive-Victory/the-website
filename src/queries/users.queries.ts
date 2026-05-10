import {
	useFetch,
	usePaginatedSearch,
} from '@/util/hooks'
import { FetchError } from '@/models'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Role, User, zUser, zUserProfile, UserProfile } from '@/contracts/data'
import { UpdateUserRequest } from '@/contracts/requests'
import { PaginatedResponse } from '@/contracts/responses'


export function useUpdatedUser({ loggedInUser }: { loggedInUser : User | undefined }) {
    const queryClient = useQueryClient()

    const { onPatch } = useFetch()

    const { search } = usePaginatedSearch<UserProfile>('/users', zUserProfile)

    const updateUser = useMutation<
        User,
        FetchError,
        { id: number; user: User; request: UpdateUserRequest },
        User | undefined
    >({
        mutationFn: async ({ id, user, request }) => {
            const result = await onPatch<User>(`/users/${id}`, request, zUser)
            return { ...user, ...result }
        },

        // When the mutation begins, optimistically update the cache to use the new state
        onMutate: ({ id, user }) => {
            const prev: User | undefined = queryClient.getQueryData([
                `/users/${id}`,
            ])
            queryClient.setQueryData([`/users/${id}`], user)
            if (id == loggedInUser?.id)
                queryClient.setQueryData(['/users/current'], user)
            queryClient.setQueryData(
                ['/users', search],
                (res: PaginatedResponse<Role>) => ({
                    ...res,
                    data: res.data.map((prev) =>
                        prev.id == user.id ? user : prev
                    ),
                })
            )
            return prev
        },

        // If an error occurs, rollback to the previous state
        onError: (error, { id }, prev) => {
            console.error(error)
            queryClient.setQueryData([`/users/${id}`], prev)
            if (id == loggedInUser?.id)
                queryClient.setQueryData(['/users/current'], prev)
            queryClient.setQueryData(
                [`/users`, search],
                (res: PaginatedResponse<Role>) => ({
                    ...res,
                    data: res.data.map((user) =>
                        user.id == prev?.id ? prev : user
                    ),
                })
            )
        },

        // On success, update the cache to the returned value in case there are any discrepancies
        onSuccess: (data, { id }) => {
            queryClient.setQueryData([`/users/${id}`], data)
            if (id == loggedInUser?.id)
                queryClient.setQueryData(['/users/current'], data)
            queryClient.setQueryData(
                [`/users`, search],
                (res: PaginatedResponse<Role>) => ({
                    ...res,
                    data: res.data.map((user) =>
                        user.id == data.id ? data : user
                    ),
                })
            )
        },

        // After either success or failure, invalidate the caches to refresh from the server
        onSettled: (_data, _error, { id }) =>
            Promise.all([
                queryClient.invalidateQueries({ queryKey: ['/users', search] }),
                queryClient.invalidateQueries({ queryKey: ['/users/current'] }),
                queryClient.invalidateQueries({
                    queryKey: [`/users/${id}`],
                }),
            ]),
	})

	return updateUser
}

