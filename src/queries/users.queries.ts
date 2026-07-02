import { ManualDonorLinkRequest } from '@/app/account/sections'
import { User, zUser } from '@/contracts/data'
import { UpdateUserRequest } from '@/contracts/requests'
import { FetchError } from '@/models'
import { useFetch } from '@/util/hooks'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useUpdatedUser({
    loggedInUser,
}: {
    loggedInUser: User | undefined
}) {
    const queryClient = useQueryClient()

    const { onGet, onPatch, onPut } = useFetch()

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
            return prev
        },

        // If an error occurs, rollback to the previous state
        onError: (error, { id }, prev) => {
            console.error(error)
            queryClient.setQueryData([`/users/${id}`], prev)
            if (id == loggedInUser?.id)
                queryClient.setQueryData(['/users/current'], prev)
        },

        // On success, update the cache to the returned value in case there are any discrepancies
        onSuccess: (data, { id }) => {
            queryClient.setQueryData([`/users/${id}`], data)
            if (id == loggedInUser?.id)
                queryClient.setQueryData(['/users/current'], data)
        },

        // After either success or failure, invalidate the caches to refresh from the server
        onSettled: (_data, _error, { id }) =>
            Promise.all([
                queryClient.invalidateQueries({ queryKey: ['/users/current'] }),
                queryClient.invalidateQueries({
                    queryKey: [`/users/${id}`],
                }),
            ]),
    })

    const linkUser = useMutation<
        User,
        FetchError,
        { id: number; user: User; donorLinkRequest: ManualDonorLinkRequest },
        User | undefined
    >({
        mutationFn: async ({ id, donorLinkRequest }) => {
            const { donorEmail: e, orderId: o } = donorLinkRequest
            await onPut(`/users/${id}/donors/${e}/link`, null, {
                query: { orderId: o },
            })

            const user = await onGet<User>(`/users/${id}`, zUser, {
                query: { includeDonors: true },
            })
            return user
        },

        // When the mutation begins, optimistically update the cache to use the new state
        onMutate: ({ id, user }) => {
            const prev: User | undefined = queryClient.getQueryData([
                `/users/${id}?includeDonors=true`,
            ])
            queryClient.setQueryData([`/users/${id}?includeDonors=true`], user)
            if (id == loggedInUser?.id)
                queryClient.setQueryData(
                    ['/users/current?includeDonors=true'],
                    user
                )
            return prev
        },

        // If an error occurs, rollback to the previous state
        onError: (error, { id }, prev) => {
            console.error(error)
            queryClient.setQueryData([`/users/${id}?includeDonors=true`], prev)
            if (id == loggedInUser?.id)
                queryClient.setQueryData(
                    ['/users/current?includeDonors=true'],
                    prev
                )
        },

        // On success, update the cache to the returned value in case there are any discrepancies
        onSuccess: (data, { id }) => {
            queryClient.setQueryData([`/users/${id}?includeDonors=true`], data)
            if (id == loggedInUser?.id)
                queryClient.setQueryData(
                    ['/users/current?includeDonors=true'],
                    data
                )
        },

        // After either success or failure, invalidate the caches to refresh from the server
        onSettled: (_data, _error, { id }) =>
            Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ['/users/current?includeDonors=true'],
                }),
                queryClient.invalidateQueries({
                    queryKey: [`/users/${id}?includeDonors=true`],
                }),
            ]),
    })

    return { updateUser, linkUser }
}
