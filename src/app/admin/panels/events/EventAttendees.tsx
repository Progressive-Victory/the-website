'use client'

import memberStyles from '../members/page.module.css'
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
import {
    DiscordEvent,
    zDiscordEvent,
    DiscordEventStatus,
    DiscordEventAttendee,
    zDiscordEventAttendee,
    zDiscordUser,
    DiscordUser,
} from '@/contracts/data'
import { zDiscordEventDetailsResponse } from '@/contracts/responses'
import { dateService } from '@/services'
import { useFetch, usePaginatedSearch } from '@/util/hooks'
import { keepPreviousData, skipToken, useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import z from 'zod'

interface EventAttendeesProps {
    attendees: DiscordEventAttendee[]
    eventId: number
}

export default function EventAttendees({
    attendees,
    eventId,
}: EventAttendeesProps) {
    const { ready, onGet } = useFetch()
    const navParams = useSearchParams()
    const navVal = navParams.get('attendeeId')

    const [selectedAttendeeId, setSelectedAttendeeId] = useState<string | null>(
        navVal ? (+navVal).toString() : null
    )
    const [loadingAttendee, setLoadingAttendee] = useState(true)

    const attendeeQuery = useQuery({
        queryKey: [`/discordUsers/${selectedAttendeeId}/user`],
        queryFn:
            ready && selectedAttendeeId != null
                ? async ({ signal }) => {
                      const discordEvent = await onGet(
                          '/discordUsers/:discordUserId/user',
                          zDiscordUser,
                          {
                              params: { discordUserId: selectedAttendeeId },
                              signal,
                          }
                      )

                      if (loadingAttendee) setLoadingAttendee(false)

                      return discordEvent
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

    const handleSelectAttendee = (attendee: DiscordEventAttendee) => {
        if (!loadingAttendee) setLoadingAttendee(true)
        if (attendee.userDiscordId === selectedAttendeeId)
            setSelectedAttendeeId(null)
        setSelectedAttendeeId(attendee.userDiscordId)
    }

    const renderAttendee = (attendee: DiscordEventAttendee) => {
        return (
            <ListElement
                key={attendee.userDiscordId}
                selected={selectedAttendeeId === attendee.userDiscordId}
                onClick={() => handleSelectAttendee(attendee)}
                className={styles.listItem}
            >
                <div className={styles.attendeeContainer}>
                    <div className={styles.attendeeMeta}>
                        <DiscordAvatar
                            discordUserId={attendee.discordUser?.id}
                            imageId={attendee.discordUser?.image}
                            size={32}
                        />
                        <span className={styles.attendeeName}>
                            {`@${attendee.discordUser?.username}`}
                        </span>
                    </div>
                </div>
            </ListElement>
        )
    }

    if (attendees.length === 0)
        return <span className={styles.readonly}>No attendees found.</span>

    return (
        <div className={styles.attendeesList}>
            {(attendees ?? []).map((a) => renderAttendee(a))}
        </div>
    )
}
