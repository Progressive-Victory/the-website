'use client'

import { FilterTags } from '../../layout/FilterTags'
import { MobileSidebarBackButton } from '../../layout/MobileSidebarBackButton'
// import memberStyles from '../members/page.module.css'
import { useEventFilters } from './eventFilters'
import styles from './page.module.css'
import { DetailView } from './panel_views/DetailView'
import Panel, { SidebarBody } from '@/components/common/panel'
import { useEventQueries } from '@/queries'
import { dateService } from '@/services'
import { keepPreviousData, skipToken, useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { DiscordEvent } from 'pv-contracts/data'
import {
    DiscordEventDetailsResponse,
    DiscordEventWithOccurrences,
} from 'pv-contracts/responses'
import { useState } from 'react'
import { FaUsers } from 'react-icons/fa6'
import { useMediaQuery } from 'usehooks-ts'

type DiscordEventTabKey = 'detail' | 'occurrences'

const eventSortFields: { value: keyof DiscordEvent; label: string }[] = [
    { value: 'scheduledStartUtc', label: 'Start Date' },
    { value: 'createdAtUtc', label: 'Created Date' },
    { value: 'channelId', label: 'Channel' },
    { value: 'creatorDiscordId', label: 'Created by' },
    { value: 'name', label: 'Name' },
]

export const formatDiscordEventDate = (
    value: Date,
    format?: Intl.DateTimeFormatOptions
) => {
    if (!dateService.isValid(value)) return undefined
    return Intl.DateTimeFormat(
        'en-US',
        format ?? {
            dateStyle: 'long',
            timeStyle: 'medium',
        }
    ).format(value)
}

export default function Page() {
    const navParams = useSearchParams()
    const eventQueries = useEventQueries()

    const navVal = navParams.get('eventId')
    const [selectedEventId, setSelectedEventId] = useState<number | null>(
        navVal ? +navVal : null
    )
    const [loadingEvent, setLoadingEvent] = useState(true)

    const [selectedTab, setSelectedTab] = useState<DiscordEventTabKey>('detail')
    const [sidebarMobileVisible, setSidebarMobileVisible] = useState(true)
    const isDesktop = useMediaQuery('(min-width: 64rem)')

    const {
        query: eventsQuery,
        search,
        onSearch,
    } = eventQueries.getEventsSummary()

    const eventQuery = useQuery({
        queryKey: [`/discordEvents/${selectedEventId}`],
        queryFn:
            eventQueries.ready && selectedEventId
                ? eventQueries.getEvent(selectedEventId, {
                      get: loadingEvent,
                      set: setLoadingEvent,
                  })
                : skipToken,
        placeholderData: keepPreviousData,
    })

    const {
        tags: eventFilterTags,
        activeTag: activeFilterTag,
        setActiveTag: setActiveFilterTag,
        filtered: filteredEvents,
    } = useEventFilters(eventsQuery.data?.data ?? [])

    const handleSelectEvent = (eventId: number | null) => {
        if (eventId === selectedEventId) return
        if (!loadingEvent) setLoadingEvent(true)
        setSelectedEventId(eventId)
    }

    const keyOccurrenceOf = (event: DiscordEventDetailsResponse | null) => {
        console.log({ event })
        if (event?.event == null) return null
        if (!event.event.recurrent)
            return (event.event as DiscordEventWithOccurrences).occurrences[0]

        const occurrences = (
            event.event as DiscordEventWithOccurrences
        ).occurrences.toSorted(
            (a, b) =>
                a.scheduledStartUtc.getTime() - b.scheduledStartUtc.getTime()
        )
        return occurrences[0]
    }

    return (
        <Panel
            includeSidebar
            collapsedSidebarMode="compact"
            sidebarList={{
                search: { search, onSearch },
                footer: {
                    page: search.page ?? 0,
                    pageSize: search.limit ?? 25,
                    count: eventsQuery.data?.count ?? 0,
                    isPending: eventsQuery.isPending,
                    onPageChange: (nextPage: number) =>
                        onSearch({ ...search, page: nextPage }),
                },
                filters: {
                    search,
                    onSearch,
                    sortFieldOptions: eventSortFields,
                    showSort: true,
                    showLimit: true,
                },
            }}
            sidebarBody={
                <>
                    <div className={styles.filterTagsWrapper}>
                        <FilterTags
                            tags={eventFilterTags}
                            activeTag={activeFilterTag}
                            onChange={setActiveFilterTag}
                        />
                    </div>
                    <SidebarBody<DiscordEventWithOccurrences>
                        items={filteredEvents ?? []}
                        isLoading={eventsQuery.isPending}
                        error={eventsQuery.error}
                        selectedKey={selectedEventId}
                        renderItem={(event: DiscordEventWithOccurrences) => ({
                            key: event.id,
                            label: String(event.id),
                            subtitle: `Scheduled: ${formatDiscordEventDate(event.createdAtUtc)}`,
                            // tagLabel: makeDateTag(item),
                            // tagClassName: styles.dateTag,
                            // subTags: makeLevelTags(item),
                            icon: (
                                <div className={styles.eventAttendeeCount}>
                                    {event.userCount ?? 0}
                                    <FaUsers size={20} />
                                </div>
                            ),
                            href: `/volunteer_dashboard/panels/events?eventId=${event.id}`,
                            onClick: (e) => {
                                e.preventDefault()
                                handleSelectEvent(event.id ?? null)
                            },
                        })}
                    />
                </>
            }
        >
            <div className={styles.detailsPane}>
                <MobileSidebarBackButton
                    label="Events"
                    sidebarMobileVisible={isDesktop || sidebarMobileVisible}
                    onBack={() => setSidebarMobileVisible(true)}
                    className={styles.backButton}
                />

                {eventQuery.data?.event && (
                    <>
                        {selectedTab === 'detail' && (
                            <DetailView
                                key={selectedEventId}
                                event={
                                    (eventQuery.data
                                        ?.event as DiscordEventWithOccurrences) ??
                                    null
                                }
                                keyOccurrence={keyOccurrenceOf(eventQuery.data)}
                                createdBy={eventQuery.data?.createdBy ?? null}
                                title={
                                    (
                                        eventQuery.data
                                            ?.event as DiscordEventWithOccurrences
                                    )?.occurrences[0].name ?? 'Event'
                                }
                                className={styles.detailsContent}
                            />
                        )}
                        {/* {selectedTab === 'occurrences' && (
                        implement this!!
                        <OccurencesView />
                    )} */}
                    </>
                )}
            </div>
        </Panel>
    )
}
