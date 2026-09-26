'use client'

import { FilterTags } from '../../layout/FilterTags'
import { MobileSidebarBackButton } from '../../layout/MobileSidebarBackButton'
import memberStyles from '../members/page.module.css'
import tagStyles from '../membership/components/Tags.module.css'
import { formatDiscordEventDate, useEventFilters } from './eventFilters'
import styles from './page.module.css'
import { DetailView } from './panel_views/DetailView'
import { OccurencesView } from './panel_views/OccurrencesView'
import Panel, { SidebarBody } from '@/components/common/panel'
import { TabBar, TabSpec } from '@/components/common/tab_bar/TabBar'
import { useEventQueries } from '@/queries'
import { dateService } from '@/services'
import { cn } from '@/util'
import { keepPreviousData, skipToken, useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { DiscordEvent, DiscordEventStatus } from 'pv-contracts/data'
import { DiscordEventWithOccurrences } from 'pv-contracts/responses'
import { useState } from 'react'
import { FaUsers } from 'react-icons/fa6'
import { useMediaQuery } from 'usehooks-ts'

type DiscordEventTabKey = 'overview' | 'occurrences'
const tabs: TabSpec[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'occurrences', label: 'Occurrences' },
]

const eventSortFields: { value: keyof DiscordEvent; label: string }[] = [
    { value: 'scheduledStartUtc', label: 'Start Date' },
    { value: 'createdAtUtc', label: 'Created Date' },
    { value: 'channelId', label: 'Channel' },
    { value: 'creatorDiscordId', label: 'Created by' },
    { value: 'name', label: 'Name' },
]

export default function Page() {
    const navParams = useSearchParams()
    const eventQueries = useEventQueries()

    const navVal = navParams.get('eventId')
    const [selectedEventId, setSelectedEventId] = useState<number | null>(
        navVal ? +navVal : null
    )
    const [loadingEvent, setLoadingEvent] = useState(true)

    const [selectedTab, setSelectedTab] =
        useState<DiscordEventTabKey>('overview')
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

    const keyOccurrenceOf = (event: DiscordEventWithOccurrences | null) => {
        if (event == null) return null
        if (!event.recurrent) return event.occurrences[0]

        const occurrences = event.occurrences.toSorted(
            (a, b) =>
                b.scheduledStartUtc.getTime() - a.scheduledStartUtc.getTime()
        )
        return occurrences[0]
    }

    const formatDate = (value: Date, format?: Intl.DateTimeFormatOptions) => {
        if (!dateService.isValid(value)) return undefined
        return Intl.DateTimeFormat(
            'en-US',
            format ?? {
                dateStyle: 'long',
                timeStyle: 'medium',
            }
        ).format(value)
    }

    const getStatusName = (status: DiscordEventStatus | null) =>
        [
            'Unknown', // for some reason the status is nullable...
            'Scheduled',
            'Active',
            'Completed',
            'Cancelled',
        ][status ?? 0]

    const statusTag = {
        0: '',
        [DiscordEventStatus.Scheduled]: tagStyles.tagYellow,
        [DiscordEventStatus.Active]: tagStyles.tagGreen,
        [DiscordEventStatus.Completed]: tagStyles.tagBlue,
        [DiscordEventStatus.Cancelled]: tagStyles.tagRed,
    }

    return (
        <Panel
            includeSidebar
            collapsedSidebarMode="compact"
            sidebarTogglePlacement="header"
            showSidebarFooterWhenCollapsed={false}
            showSidebarBorderWhenCollapsed
            largeTitle
            sidebarWidth="25.5rem"
            collapsedSidebarWidth="5rem"
            sidebarClassName={styles.sidebarBg}
            sidebarMobileVisible={isDesktop || sidebarMobileVisible}
            showScrollbar={false}
            label="Events"
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
                            label:
                                keyOccurrenceOf(event)?.name ??
                                `Event ${event.id}`,
                            subtitle: `Scheduled: ${formatDiscordEventDate(event.createdAtUtc)}`,
                            renderTag: (
                                <div
                                    className={cn(
                                        styles.eventAttendeeCountTag,
                                        tagStyles.tag,
                                        statusTag[
                                            keyOccurrenceOf(event)?.status ?? 0
                                        ]
                                    )}
                                >
                                    <FaUsers size={18} />
                                    {event.userCount ?? 0}
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

                {!eventQuery.data?.event && (
                    <div className={styles.emptyState}>No event selected</div>
                )}

                {eventQuery.isLoading && (
                    <div className={styles.emptyState}>Loading...</div>
                )}

                {eventQuery.data?.event && (
                    <>
                        <div className={styles.detailsHeader}>
                            {keyOccurrenceOf(eventQuery.data.event)
                                ?.thumbnailUrl ? (
                                <Image
                                    src={
                                        keyOccurrenceOf(eventQuery.data.event)!
                                            .thumbnailUrl!
                                    }
                                    alt={
                                        keyOccurrenceOf(eventQuery.data.event)!
                                            .name
                                    }
                                    width={807}
                                    height={323}
                                    className={styles.detailsEventThumbnail}
                                />
                            ) : (
                                <div
                                    className={cn(
                                        styles.detailsEventThumbnail,
                                        styles.placeholder
                                    )}
                                />
                            )}
                            <div className={styles.headerTop}>
                                <div className={styles.cardStyle}>
                                    <div className={styles.userInfo}>
                                        <h1
                                            className={
                                                memberStyles.headerUserName
                                            }
                                        >
                                            {
                                                keyOccurrenceOf(
                                                    eventQuery.data.event
                                                )?.name
                                            }
                                        </h1>
                                        <h2
                                            className={
                                                memberStyles.headerUserUsername
                                            }
                                        >
                                            {keyOccurrenceOf(
                                                eventQuery.data.event
                                            )?.scheduledStartUtc &&
                                                formatDate(
                                                    keyOccurrenceOf(
                                                        eventQuery.data.event
                                                    )!.scheduledStartUtc
                                                )}
                                        </h2>
                                    </div>
                                </div>
                                <div
                                    className={
                                        styles.detailsEventDecorationContainer
                                    }
                                >
                                    <span
                                        className={cn(
                                            tagStyles.tag,
                                            statusTag[
                                                keyOccurrenceOf(
                                                    eventQuery.data.event
                                                )?.status ?? 'Unknown'
                                            ]
                                        )}
                                    >
                                        {getStatusName(
                                            keyOccurrenceOf(
                                                eventQuery.data.event
                                            )?.status ?? null
                                        )}
                                    </span>
                                    {eventQuery.data.event.recurrent && (
                                        <span
                                            className={cn(
                                                tagStyles.tag,
                                                styles.recurrent
                                            )}
                                        >
                                            Recurring
                                        </span>
                                    )}
                                </div>
                                <TabBar
                                    tabs={tabs}
                                    value={selectedTab}
                                    onChange={(key) => {
                                        console.log({ key, selectedTab })
                                        setSelectedTab(
                                            key as DiscordEventTabKey
                                        )
                                    }}
                                />
                            </div>
                        </div>
                        {selectedTab === 'overview' && (
                            <DetailView
                                key={selectedEventId}
                                event={eventQuery.data?.event ?? null}
                                keyOccurrence={keyOccurrenceOf(
                                    eventQuery.data.event
                                )}
                                createdBy={eventQuery.data?.createdBy ?? null}
                                title={
                                    keyOccurrenceOf(eventQuery.data.event)
                                        ?.name ?? 'Event'
                                }

                                className={styles.detailsContent}
                            />
                        )}
                        {selectedTab === 'occurrences' && (
                            <OccurencesView
                                event={eventQuery.data?.event ?? null}
                                keyOccurrence={keyOccurrenceOf(
                                    eventQuery.data.event
                                )}
                                title={
                                    keyOccurrenceOf(eventQuery.data.event)
                                        ?.name ?? 'Event'
                                }
                            />
                        )}
                    </>
                )}
            </div>
        </Panel>
    )
}
