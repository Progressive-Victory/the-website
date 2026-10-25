import { useFetch, usePaginatedSearch } from '@/util/hooks'
import { DiscordEvent, zDiscordEventAttendee } from 'pv-contracts/data'
import {
    DiscordEventOccurrence,
    DiscordEventWithOccurrences,
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

    const eventWithAttendees = async (
        discordEvent: DiscordEventOccurrence,
        signal: AbortSignal
    ) => {
        const attendees = await onGet(
            '/discordEvents/:eventId/attendance',
            z.array(zDiscordEventAttendee),
            {
                params: { eventId: discordEvent.id },
                query: { includeDiscordUsers: true },
                signal,
            }
        )
        return {
            ...discordEvent,
            attendees,
        }
    }

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

                const occurrences = await Promise.all(
                    (
                        discordEvent.event as DiscordEventWithOccurrences
                    )?.occurrences.map((occurrence) =>
                        eventWithAttendees(occurrence, signal)
                    )
                )

                if (eventLoading.get) eventLoading.set(false)

                return {
                    ...discordEvent,
                    event: {
                        ...discordEvent.event,
                        occurrences,
                    },
                }
            },
    }
}
