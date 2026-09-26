// import endorsementStyles from './DetailView.module.css'
import endorsementStyles from '../../endorsements/panel_views/DetailView.module.css'
import { formatDiscordEventDate } from '../page'
import { DiscordAvatar } from '@/components/common'
import {
    DateField,
    Form,
    FormField,
    FormGroup,
    TextField,
} from '@/components/common/forms'
import formStyles from '@/components/common/forms/FormField.module.css'
import { cn } from '@/util'
import { DiscordEventStatus } from 'pv-contracts/data'
import {
    DiscordEventDetailsResponse,
    DiscordEventOccurrence,
    DiscordEventWithOccurrences,
} from 'pv-contracts/responses'

const statusName = (status: DiscordEventStatus | null | undefined) =>
    [
        'Unknown', // for some reason the status is nullable...
        'Scheduled',
        'Active',
        'Completed',
        'Cancelled',
    ][status ?? 0]

interface DetailViewProps {
    event: DiscordEventWithOccurrences | null
    // "most recent event" in most cases; used for status and occurence-specific data.
    // can be used in the future to display details for any occurrence.
    keyOccurrence: DiscordEventOccurrence | null
    createdBy: DiscordEventDetailsResponse['createdBy'] | null
    title: string
    beforeHeader?: React.ReactElement
    className?: string
}

export function DetailView({
    event,
    keyOccurrence,
    createdBy,
    title,
    beforeHeader,
    className,
}: DetailViewProps) {
    return (
        <>
            <Form<DiscordEventWithOccurrences>
                className={className}
                form={event}
                title={title}
                beforeHeader={beforeHeader}
                readonly={true}
            >
                <FormGroup title="Event Info">
                    <TextField
                        label="Name"
                        getter={() => keyOccurrence?.name}
                        required
                    />
                    <TextField
                        label="Description"
                        getter={() => keyOccurrence?.description}
                    />
                    <FormField label="Status">
                        <div
                            className={cn(
                                endorsementStyles.detailsStatusField,
                                keyOccurrence &&
                                    endorsementStyles[
                                        statusName(
                                            keyOccurrence.status
                                        ).toLocaleLowerCase()
                                    ]
                            )}
                        >
                            <span className={formStyles.readonly}>
                                {statusName(keyOccurrence?.status ?? null)}
                            </span>
                        </div>
                    </FormField>
                    <FormField label="Recurring">
                        <span className={formStyles.readonly}>
                            {event!.recurrent ? 'Yes' : 'No'}
                        </span>
                    </FormField>
                    <FormField label="Created By">
                        <div
                            className={
                                endorsementStyles.detailsCreatedByContainer
                            }
                        >
                            <DiscordAvatar
                                discordUserId={createdBy?.id}
                                imageId={createdBy?.image}
                                size={24}
                            />
                            <span className={formStyles.readonly}>
                                {`@${
                                    createdBy?.username ??
                                    event!.creatorDiscordId ??
                                    'Unknown'
                                }`}
                            </span>
                        </div>
                    </FormField>
                    <DateField label="Created At" field="createdAtUtc" />
                    <DateField
                        label="Scheduled Start"
                        getter={() => keyOccurrence?.scheduledStartUtc}
                    />
                    <DateField
                        label="Scheduled End"
                        getter={() => keyOccurrence?.scheduledEndUtc}
                    />
                    <FormField label="Started At">
                        <span className={formStyles.readonly}>
                            {keyOccurrence?.startedAtUtc
                                ? formatDiscordEventDate(
                                      keyOccurrence.startedAtUtc
                                  )
                                : 'Not started'}
                        </span>
                    </FormField>
                    <FormField label="Ended At">
                        <span className={formStyles.readonly}>
                            {keyOccurrence?.startedAtUtc ||
                            keyOccurrence?.status === 2
                                ? keyOccurrence.endedAtUtc
                                    ? formatDiscordEventDate(
                                          keyOccurrence.endedAtUtc
                                      )
                                    : 'Active'
                                : 'Not started'}
                        </span>
                    </FormField>
                </FormGroup>
            </Form>
        </>
    )
}
