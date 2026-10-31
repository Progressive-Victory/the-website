import { useFetch } from './useFetch'
import { skipToken, useQueries } from '@tanstack/react-query'
import { zUser, type UserProfile } from 'pv-contracts/data'

export function useAssignedUsers(positions: { userIds: number[] }[]) {
    const { ready, onGet } = useFetch()
    const userIds = [...new Set(positions.flatMap(({ userIds }) => userIds))]
    return useQueries({
        queries: userIds.map((userId) => ({
            queryKey: ['/users/:userId', userId, { includeDiscordUsers: true }],
            queryFn: ready
                ? ({ signal }: { signal: AbortSignal }) =>
                      onGet('/users/:userId', zUser, {
                          params: { userId },
                          query: { includeDiscordUsers: true },
                          signal,
                      })
                : skipToken,
            staleTime: 5 * 60 * 1000,
        })),
        combine: (queries) => ({
            users: queries.flatMap(({ data }): UserProfile[] =>
                data
                    ? [
                          {
                              ...data,
                              aliases: data.aliases ?? [],
                              discordUsers: data.discordUsers ?? [],
                          },
                      ]
                    : []
            ),
            error: queries.find(({ error }) => error)?.error ?? null,
        }),
    })
}
