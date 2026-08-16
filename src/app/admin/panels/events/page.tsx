'use client'

import memberStyles from '../members/page.module.css'
import EventAttendees from './EventAttendees'
import styles from './page.module.css'
import { ListElement, List } from '@/app/admin/layout/List'
import { DiscordAvatar } from '@/components/common'
import {
    DateField,
    Form,
    FormField,
    FormGroup,
    TextField,
} from '@/components/common/forms'
import formStyles from '@/components/common/forms/FormField.module.css'
import LoadingSpinner from '@/components/common/loading_spinner/LoadingSpinner'
import {
    DiscordEvent,
    zDiscordEvent,
    DiscordEventStatus,
    zDiscordEventAttendee,
} from '@/contracts/data'
import { zDiscordEventDetailsResponse } from '@/contracts/responses'
import { dateService } from '@/services'
import { cn } from '@/util'
import { useFetch, usePaginatedSearch } from '@/util/hooks'
import { keepPreviousData, skipToken, useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { redirect, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { FaUsers } from 'react-icons/fa6'
import z from 'zod'

export default function Page() {
    const { ready, onGet } = useFetch()
    const navParams = useSearchParams()
    const navVal = navParams.get('eventId')

    const [selectedEventId, setSelectedEventId] = useState<number | null>(
        navVal ? +navVal : null
    )
    const [loadingEvent, setLoadingEvent] = useState(true)

    const {
        query: searchQuery,
        search,
        onSearch,
    } = usePaginatedSearch('/discordEvents', zDiscordEvent)

    const eventQuery = useQuery({
        queryKey: [`/discordEvents/${selectedEventId}`],
        queryFn:
            ready && selectedEventId != null
                ? async ({ signal }) => {
                      const discordEvent = await onGet(
                          '/discordEvents/:eventId',
                          zDiscordEventDetailsResponse,
                          {
                              params: { eventId: selectedEventId },
                              query: { includeCreator: true },
                              signal,
                          }
                      )

                      const attendees = await onGet(
                          '/discordEvents/:eventId/attendance',
                          z.array(zDiscordEventAttendee),
                          {
                              params: { eventId: selectedEventId },
                              query: { includeDiscordUsers: true },
                              signal,
                          }
                      )

                      if (loadingEvent) setLoadingEvent(false)

                      return {
                          ...discordEvent,
                          event: {
                              ...discordEvent.event,
                              attendees,
                          },
                      }
                  }
                : skipToken,
        placeholderData: keepPreviousData,
    })

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

    const handleSelectEvent = (event: DiscordEvent) => {
        if (event.id === selectedEventId) return
        if (!loadingEvent) setLoadingEvent(true)
        setSelectedEventId(event.id)
        redirect(`/admin/panels/events?eventId=${event.id}`)
    }

    const getStatusName = (status: DiscordEventStatus | null) =>
        [
            'Unknown', // for some reason the status is nullable...
            'Scheduled',
            'Active',
            'Completed',
            'Cancelled',
        ][status ?? 0]

    const renderEvent = (event: DiscordEvent) => {
        return (
            <ListElement
                key={event.id}
                selected={selectedEventId === event.id}
                onClick={() => handleSelectEvent(event)}
                className={styles.listItem}
            >
                <div className={styles.eventContainer}>
                    <div
                        className={cn(
                            styles.eventStatus,
                            styles[
                                getStatusName(event.status).toLocaleLowerCase()
                            ]
                        )}
                    />
                    <div className={styles.eventMeta}>
                        <span className={styles.eventName}>{event.name}</span>
                        <span className={styles.eventNextStart}>
                            Scheduled: {formatDate(event.scheduledStartUtc)}
                        </span>
                    </div>
                    <div className={styles.eventAttendeeCount}>
                        {event.userCount ?? 0}
                        <FaUsers size={20} />
                    </div>
                </div>
            </ListElement>
        )
    }

    return (
        <div className={styles.root}>
            <List
                search={search}
                count={searchQuery.data?.count}
                isPending={searchQuery.isPending}
                error={searchQuery.error}
                searchFields={[
                    { label: 'Name', value: 'name' },
                    { label: 'Description', value: 'description' },
                    { label: 'Scheduled Start', value: 'scheduled_start_utc' },
                    { label: 'Scheduled End', value: 'scheduled_end_utc' },
                    // i would like to search by creator, but that would require a heavier paginated search response body.
                    // not pursuing at this time.
                ]}
                sortFields={[
                    { label: 'Name', value: 'name' },
                    { label: 'Description', value: 'description' },
                    { label: 'Created At', value: 'created_at_utc' },
                    { label: 'Scheduled Start', value: 'scheduled_start_utc' },
                    { label: 'Scheduled End', value: 'scheduled_end_utc' },
                    { label: 'Started At', value: 'started_at_utc' },
                    { label: 'Ended At', value: 'ended_at_utc' },
                ]}
                onSearch={onSearch}
            >
                {searchQuery.data?.data?.map((e) => renderEvent(e))}
            </List>

            <div className={styles.detailsPane}>
                {selectedEventId == null && (
                    <div className={styles.emptyState}>No Event Selected</div>
                )}
                {selectedEventId && !eventQuery.data && loadingEvent && (
                    <LoadingSpinner />
                )}
                {selectedEventId && eventQuery.data && (
                    <>
                        <div className={styles.detailsHeader}>
                            {/* <div className={memberStyles.bannerCover} /> */}
                            <Image
                                src={eventQuery.data.event.thumbnailUrl}
                                alt={eventQuery.data.event.name}
                                width={807}
                                height={323}
                                className={styles.detailsEventThumbnail}
                            />
                            <div className={memberStyles.headerTop}>
                                <div className={memberStyles.cardStyle}>
                                    <div className={memberStyles.userInfo}>
                                        <h1
                                            className={
                                                memberStyles.headerUserName
                                            }
                                        >
                                            {eventQuery.data.event.name}
                                        </h1>
                                        <h2
                                            className={
                                                memberStyles.headerUserUsername
                                            }
                                        >
                                            {formatDate(
                                                eventQuery.data.event
                                                    .scheduledStartUtc
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
                                            styles.statusPill,
                                            styles[
                                                getStatusName(
                                                    eventQuery.data.event.status
                                                ).toLocaleLowerCase()
                                            ]
                                        )}
                                    >
                                        {getStatusName(
                                            eventQuery.data.event.status
                                        )}
                                    </span>
                                    {eventQuery.data.event.recurrent && (
                                        <span
                                            className={cn(
                                                styles.statusPill,
                                                styles.recurrent
                                            )}
                                        >
                                            Recurring
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <Form<DiscordEvent>
                            key={selectedEventId}
                            form={eventQuery.data.event}
                            title={eventQuery.data.event.name}
                            readonly={true}
                            saving={false}
                            isInvalid={false}
                        >
                            <FormGroup title="Event Info">
                                <TextField label="Name" field="name" />
                                <TextField
                                    label="Description"
                                    field="description"
                                />
                                <FormField label="Status">
                                    <div
                                        className={cn(
                                            styles.detailsStatusField,
                                            styles[
                                                getStatusName(
                                                    eventQuery.data.event.status
                                                ).toLocaleLowerCase()
                                            ]
                                        )}
                                    >
                                        <span className={formStyles.readonly}>
                                            {getStatusName(
                                                eventQuery.data.event.status
                                            )}
                                        </span>
                                    </div>
                                </FormField>
                                <FormField label="Recurring">
                                    <span className={formStyles.readonly}>
                                        {eventQuery.data.event.recurrent
                                            ? 'Yes'
                                            : 'No'}
                                    </span>
                                </FormField>
                                <FormField label="Created By">
                                    <div
                                        className={
                                            styles.detailsCreatedByContainer
                                        }
                                    >
                                        <DiscordAvatar
                                            discordUserId={
                                                eventQuery.data.createdBy.id
                                            }
                                            imageId={
                                                eventQuery.data.createdBy.image
                                            }
                                            size={24}
                                        />
                                        <span className={formStyles.readonly}>
                                            {`@${
                                                eventQuery.data.createdBy
                                                    ?.username ??
                                                eventQuery.data.event
                                                    .creatorDiscordId ??
                                                'Unknown'
                                            }`}
                                        </span>
                                    </div>
                                </FormField>
                                <DateField
                                    label="Created At"
                                    field="createdAtUtc"
                                />
                                <DateField
                                    label="Scheduled Start"
                                    field="scheduledStartUtc"
                                />
                                <DateField
                                    label="Scheduled End"
                                    field="scheduledEndUtc"
                                />
                                <FormField label="Started At">
                                    <span className={formStyles.readonly}>
                                        {eventQuery.data.event.startedAtUtc
                                            ? formatDate(
                                                  eventQuery.data.event
                                                      .startedAtUtc
                                              )
                                            : 'Not started'}
                                    </span>
                                </FormField>
                                <FormField label="Ended At">
                                    <span className={formStyles.readonly}>
                                        {eventQuery.data.event.startedAtUtc ||
                                        eventQuery.data.event.status === 2
                                            ? eventQuery.data.event.endedAtUtc
                                                ? formatDate(
                                                      eventQuery.data.event
                                                          .endedAtUtc
                                                  )
                                                : 'Active'
                                            : 'Not started'}
                                    </span>
                                </FormField>
                            </FormGroup>
                            <FormGroup
                                title={
                                    <h2>
                                        Attendees
                                        {eventQuery.data?.event.attendees
                                            .length !== 0 && (
                                            <span
                                                className={styles.attendeeCount}
                                            >
                                                {` (${
                                                    eventQuery.data?.event
                                                        .attendees.length
                                                })`}
                                            </span>
                                        )}
                                    </h2>
                                }
                            >
                                {
                                    <EventAttendees
                                        attendees={
                                            eventQuery.data?.event.attendees ??
                                            []
                                        }
                                    />
                                }
                            </FormGroup>
                        </Form>
                    </>
                )}
            </div>
        </div>
    )
}
