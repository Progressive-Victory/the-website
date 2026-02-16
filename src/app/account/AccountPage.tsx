'use client'

import { AccountInfoForm } from './AccountInfoForm'
import styles from '@/app/account/account.module.css'
import { Role, User, UserProfile, zUser, zUserProfile } from '@/contracts/data'
import { UpdateUserRequest } from '@/contracts/requests'
import { PaginatedResponse } from '@/contracts/responses'
import {
    FetchError,
    hasPermission,
    useCurrentUser,
    useFetch,
    usePaginatedSearch,
} from '@/util/hooks'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useMemo } from 'react'

export function Account() {
    const { data: session } = useSession()
    const queryClient = useQueryClient()
    const { onSignOut, onPatch } = useFetch()
    const loggedInUser = useCurrentUser()

    const canAccessAdminPanel = useMemo(() => {
        return loggedInUser.data
            ? hasPermission(loggedInUser.data, 'Admin Panel Access')
            : false
    }, [loggedInUser.data])

    const handleSignOut = () => {
        void onLogout()
    }

    const { search } = usePaginatedSearch<UserProfile>('/users', zUserProfile)

    const updateMutation = useMutation<
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
            if (id == loggedInUser.data?.id)
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
            if (id == loggedInUser.data?.id)
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
            if (id == loggedInUser.data?.id)
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

    const onSave = (user: User) => {
        updateMutation.mutate({
            id: user.id,
            user,
            request: {
                email: user.email,
                phone: user.phone,
                firstName: user.firstName,
                lastName: user.lastName,
                birthdate: user.birthdate,
                zipCode: user.location?.zip ?? null,
            },
        })
    }

    if (!session) return null

    return (
        <div className={styles.pageRoot}>
            <div className={styles.contentColumn}>
                <p className={styles.pageTitle}>Account Dashboard</p>
                <div className={styles.contentRow}>
                    <div className={styles.accountColumn}>
                        <div className={styles.accountControls}>
                            <div className={styles.sectionHeader}>
                                Account Controls
                            </div>

                            <div className={styles.controlRow}>
                                <button
                                    type="button"
                                    onClick={handleSignOut}
                                    className={styles.primaryButton}
                                >
                                    Sign Out
                                </button>

                                {canAccessAdminPanel && (
                                    <Link
                                        href="/admin"
                                        className={styles.adminLink}
                                    >
                                        <span className={styles.primaryButton}>
                                            Admin Panel
                                        </span>
                                    </Link>
                                )}
                            </div>
                        </div>

                        {loggedInUser.data && (
                            <AccountInfoForm
                                user={loggedInUser.data}
                                onSave={onSave}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
