import { TokenClaims } from '@/contracts/data'
import { DiscordLoginResponse } from '@/contracts/responses'
import { ApiError, FetchError } from '@/models'
import {
    keepPreviousData,
    skipToken,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query'
import { useEffect } from 'react'

export function useAuth() {
    const queryClient = useQueryClient()

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

    const sessionQuery = useQuery({
        queryKey: ['/auth'],
        queryFn: apiBaseUrl
            ? async () => {
                  const res = await fetch(new URL('/auth', apiBaseUrl), {
                      credentials: 'include',
                  })

                  if (!res.ok) {
                      if (res.status == 404) return null

                      const error = (await res.json()) as ApiError
                      throw new FetchError(
                          error.message,
                          res.status,
                          error.error
                      )
                  }

                  return (await res.json()) as TokenClaims
              }
            : skipToken,
    })

    const loginMutation = useMutation<void, Error, { redirect?: string }>({
        mutationKey: ['/auth/discord/login'],
        async mutationFn({ redirect }) {
            if (!apiBaseUrl) return

            const redirectUri =
                redirect ?? encodeURIComponent(window.location.href)
            const errorUri = `${window.location.origin}/login`

            const res = await fetch(
                new URL(
                    `/auth/discord/login?redirectUri=${redirectUri}&errorUri=${errorUri}`,
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
        async mutationFn() {
            if (!apiBaseUrl) return
            await fetch(new URL('/auth/refresh', apiBaseUrl), {
                method: 'POST',
                credentials: 'include',
            })
        },
        async onSuccess() {
            await queryClient.invalidateQueries({ queryKey: ['/auth'] })
        },
    })

    const logoutMutation = useMutation({
        mutationKey: ['/auth/logout'],
        mutationFn: async () => {
            if (!apiBaseUrl) return
            await fetch(new URL('/auth/logout', apiBaseUrl), {
                method: 'POST',
                credentials: 'include',
            })
        },
        async onSuccess() {
            window.location.href = '/'
            await queryClient.invalidateQueries({ queryKey: ['/auth'] })
        },
    })

    const onLogin = (redirect?: string) =>
        loginMutation.mutateAsync({ redirect })
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
        isSessionLoading: sessionQuery.isLoading,
        session: sessionQuery.data ?? null,
        onLogin,
        onRefresh,
        onLogout,
    }
}
