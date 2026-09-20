import { useFetch, usePaginatedSearch } from '@/util/hooks'
import { DiscordEvent, zDiscordEventAttendee } from 'pv-contracts/data'
import {
    zDiscordEventDetailsResponse,
    zDiscordEventWithOccurrences,
} from 'pv-contracts/responses'
import z from 'zod'

export function useEventQueries() {
    const { ready, onGet } = useFetch()

    const eventsSummary = usePaginatedSearch(
        '/discordEvents',
        zDiscordEventWithOccurrences
    )

    return {
        ready,
        getEventsSummary: () => eventsSummary,
        getEvent:
            (
                eventId: DiscordEvent['id'],
                // trying something
                eventLoading: { get: boolean; set: (loading: boolean) => void }
            ) =>
            async ({ signal }: { signal: AbortSignal }) => {
                const discordEvent = await onGet(
                    '/v2/discordEvents/:eventId',
                    zDiscordEventDetailsResponse,
                    {
                        params: { eventId },
                        query: { includeOccurrences: true },
                        signal,
                    }
                )

                const attendees = await onGet(
                    '/discordEvents/:eventId/attendance',
                    z.array(zDiscordEventAttendee),
                    {
                        params: { eventId },
                        query: { includeDiscordUsers: true },
                        signal,
                    }
                )

                if (eventLoading.get) eventLoading.set(false)

                return {
                    ...discordEvent,
                    event: {
                        ...discordEvent.event,
                        attendees,
                    },
                }
            },
    }
}
