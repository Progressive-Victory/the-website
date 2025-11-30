import { useFetch } from './useFetch'
import { DiscordMember, zDiscordMember } from '@/models'
import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

export function useDiscordMember(lazy?: boolean) {
    const { onGet } = useFetch()
    const { data: session } = useSession()

    const discordId = session?.discordId

    const { isLoading, error, data, refetch } = useQuery({
        queryKey: [`/discord/members/${discordId}`],
        queryFn: async ({ signal }) =>
            await onGet<DiscordMember>(
                `/discord/members/${discordId}`,
                zDiscordMember,
                signal
            ),
        enabled: !lazy && session != null,
    })

    return { data, isLoading, error, onFetch: refetch }
}
