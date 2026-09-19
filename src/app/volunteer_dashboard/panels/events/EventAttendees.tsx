'use client'

import styles from './page.module.css'
import { ListElement } from '@/app/admin/layout/List'
import { DiscordAvatar } from '@/components/common'
import { DiscordEventAttendee } from '@/contracts/data'
import { redirect, RedirectType } from 'next/navigation'
import { FaArrowUpRightFromSquare } from 'react-icons/fa6'

interface EventAttendeesProps {
    attendees: DiscordEventAttendee[]
}

export default function EventAttendees({ attendees }: EventAttendeesProps) {
    const handleSelectAttendee = (attendee: DiscordEventAttendee) => {
        // redirect to user pane
        redirect(
            `/admin/panels/members${attendee.discordUser ? `?id=${attendee.discordUser.userId}` : ''}`,
            RedirectType.push
        )
    }

    const renderAttendee = (attendee: DiscordEventAttendee, index: number) => {
        // index here is a temporary stopgap while the event attendees are allowed
        // to be duplicated
        return (
            <div
                key={[attendee.userDiscordId, index].join()}
                className={styles.attendeeListItem}
            >
                <ListElement onClick={() => handleSelectAttendee(attendee)}>
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
                        <button className={styles.attendeeCardRedirectButton}>
                            <FaArrowUpRightFromSquare
                                size={12}
                                className={styles.attendeeCardRedirectIcon}
                            />
                        </button>
                    </div>
                </ListElement>
            </div>
        )
    }

    if (attendees.length === 0)
        return <span className={styles.readonly}>No attendees found.</span>

    return (
        <div className={styles.attendeesList}>
            {(attendees ?? []).map(renderAttendee)}
        </div>
    )
}
