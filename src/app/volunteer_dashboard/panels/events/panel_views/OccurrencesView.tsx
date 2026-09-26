import { formatDiscordEventDate } from '../page'
import { OccurrenceCard } from './OccurrenceCard'
import styles from './panels.module.css'
import { Form, FormGroup } from '@/components/common/forms'
import { cn } from '@/util'
import { DiscordEventStatus } from 'pv-contracts/data'
import {
    DiscordEventOccurrence,
    DiscordEventWithOccurrences,
} from 'pv-contracts/responses'

interface OccurrencesViewProps {
    event: DiscordEventWithOccurrences | null
    keyOccurrence: DiscordEventOccurrence | null
    title: string
    beforeHeader?: React.ReactElement
    className?: string
}

export function OccurencesView({
    event,
    keyOccurrence,
    title,
    beforeHeader,
    className,
}: OccurrencesViewProps) {
    const sortOccurrences = (event: DiscordEventWithOccurrences) =>
        event?.occurrences.toSorted((a, b) => {
            if (b.endedAtUtc && a.endedAtUtc)
                return b.endedAtUtc.getTime() - a.endedAtUtc.getTime()
            if (b.scheduledEndUtc && a.scheduledEndUtc)
                return b.scheduledEndUtc.getTime() - a.scheduledEndUtc.getTime()
            if (b.scheduledStartUtc && a.scheduledStartUtc)
                return (
                    b.scheduledStartUtc.getTime() -
                    a.scheduledStartUtc.getTime()
                )
            return 0
        })

    return (
        <div className={cn(styles.occurrencesSection, className)}>
            <FormGroup
                title={
                    <h2 className={styles.header}>
                        Occurrences
                        {event?.occurrences?.length !== 0 && (
                            <span className={styles.attendeeCount}>
                                {` (${event?.occurrences?.length ?? 0})`}
                            </span>
                        )}
                    </h2>
                }
            >
                <section className={styles.occurrenceList}>
                    {event?.occurrences ? (
                        sortOccurrences(event).map((occurrence) => (
                            <OccurrenceCard
                                key={occurrence.id}
                                occurrence={occurrence}
                            />
                        ))
                    ) : (
                        <p>No occurrences found.</p>
                    )}
                </section>
                {
                    // <EventSubItems
                    //     items={
                    //         event?.occurrences
                    //             ? sortOccurrences(event)
                    //             : ([] as DiscordEventOccurrence[])
                    //     }
                    //     generators={{
                    //         key: (occ) => String(occ.id),
                    //         href: () =>
                    //             `/admin/panels/events${keyOccurrence?.id ? `?id=${keyOccurrence.id}` : ''}`,
                    //         label: (occ) => occ.name,
                    //         subtitle: (occ) =>
                    //             formatDate(
                    //                 occ.endedAtUtc ??
                    //                     occ.startedAtUtc ??
                    //                     occ.scheduledStartUtc
                    //             ) ?? '',
                    //     }}
                    // />
                }
            </FormGroup>
        </div>
    )
}
