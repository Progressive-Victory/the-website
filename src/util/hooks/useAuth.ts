import { TokenClaims } from '@/contracts/data'
import { DiscordLoginResponse } from '@/contracts/responses'
import { ApiError, FetchError } from '@/models'
import {
    keepPreviousData,
    skipToken,
    useMutation,
    useQuery,
} from '@tanstack/react-query'
import { useEffect } from 'react'

export function useAuth() {
    const settingsQuery = useQuery({
        queryKey: ['/api/settings'],
        async queryFn({ signal }) {
            const res = await fetch('/api/settings', { signal })
            return (await res.json()) as {
                apiBaseUrl: string
            }
        },
        staleTime: Infinity,
        placeholderData: keepPreviousData,
    })

    const apiBaseUrl = settingsQuery.data?.apiBaseUrl

    const getSession = async () => {
        const res = await fetch(new URL('/auth', apiBaseUrl))

        if (!res.ok) {
            const error = (await res.json()) as ApiError
            throw new FetchError(error.message, res.status, error.error)
        }

        return (await res.json()) as TokenClaims
    }
    const sessionQuery = useQuery({
        queryKey: ['/auth'],
        queryFn: apiBaseUrl ? getSession : skipToken,
    })

    const loginMutation = useMutation({
        mutationKey: ['/auth/discord/login'],
        mutationFn: async () => {
            if (!apiBaseUrl) return

            const redirectUri = encodeURIComponent(window.location.href)

            const res = await fetch(
                new URL(
                    `/auth/discord/login?redirectUri=${redirectUri}`,
                    apiBaseUrl
                )
            )

            if (!res.ok) throw new Error('Failed to get login url from the API')

            const login = (await res.json()) as DiscordLoginResponse
            window.location.href = login.redirectUri
        },
    })

    const refreshMutation = useMutation({
        mutationKey: ['/auth/refresh'],
        mutationFn: async () => {
            if (!apiBaseUrl) return
            await fetch(new URL('/auth/refresh', apiBaseUrl), {
                method: 'POST',
            })
        },
    })

    const logoutMutation = useMutation({
        mutationKey: ['/auth/logout'],
        mutationFn: async () => {
            if (!apiBaseUrl) return
            await fetch(new URL('/auth/logout', apiBaseUrl), {
                method: 'POST',
            })
        },
    })

    const onLogin = loginMutation.mutateAsync
    const onRefresh = refreshMutation.mutateAsync
    const onLogout = logoutMutation.mutateAsync

    useEffect(() => {
        const interval = setInterval(() => {
            void onRefresh()
        }, 60000)

        return () => clearInterval(interval)
    }, [onRefresh])

    return {
        apiBaseUrl,
        session: sessionQuery.data,
        onLogin,
        onRefresh,
        onLogout,
    }
}
