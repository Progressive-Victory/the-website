import EventSubItems from './EventSubItems'
import styles from './panels.module.css'
import { Form, FormGroup } from '@/components/common/forms'
import { dateService } from '@/services'
import {
    DiscordEventOccurrence,
    DiscordEventWithOccurrences,
} from 'pv-contracts/responses'

interface OccurrencesViewProps {
    event: DiscordEventWithOccurrences | null
    keyOccurrence: DiscordEventOccurrence | null
    // createdBy: DiscordEventDetailsResponse['createdBy'] | null
    title: string
    // saving: boolean
    // onUpdate: (next: FormState<DiscordEvent> | null) => void
    // onSave: (event: DiscordEvent) => void | boolean
    // onCreate: () => DiscordEvent
    // onDelete: () => void
    // onCancel: () => void
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
        <Form<DiscordEventWithOccurrences>
            className={className}
            form={event}
            title={title}
            beforeHeader={beforeHeader}
            readonly={true}
        >
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
                {
                    <EventSubItems
                        items={
                            event?.occurrences
                                ? sortOccurrences(event)
                                : ([] as DiscordEventOccurrence[])
                        }
                        generators={{
                            key: (occ) => String(occ.id),
                            href: () =>
                                `/admin/panels/events${keyOccurrence?.id ? `?id=${keyOccurrence.id}` : ''}`,
                            label: (occ) => occ.name,
                            subtitle: (occ) =>
                                formatDate(
                                    occ.endedAtUtc ??
                                        occ.startedAtUtc ??
                                        occ.scheduledStartUtc
                                ) ?? '',
                        }}
                    />
                }
            </FormGroup>
        </Form>
    )
}
