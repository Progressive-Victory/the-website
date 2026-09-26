import tagStyles from '../../membership/components/Tags.module.css'
import { formatDiscordEventDate } from '../eventFilters'
import styles from './OccurrenceCard.module.css'
import { DiscordAvatar } from '@/components/common'
import {
    DateField,
    Form,
    FormField,
    FormGroup,
    TextField,
} from '@/components/common/forms'
import { NavigationButton } from '@/components/common/navigation_stack/navigation_button/NavigationButton'
import { cn } from '@/util'
import Image from 'next/image'
import { DiscordEventStatus } from 'pv-contracts/data'
import { DiscordEventOccurrence } from 'pv-contracts/responses'

interface OccurrenceCardProps {
    occurrence: DiscordEventOccurrence
}

export function OccurrenceCard({ occurrence }: OccurrenceCardProps) {
    const relevantDate =
        occurrence.endedAtUtc ??
        occurrence.scheduledEndUtc ??
        occurrence.scheduledStartUtc

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

    const getChannelName = (channelId: string) => {
        return `${channelId} (not implemented)`
    }

    return (
        <div className={styles.card}>
            {occurrence.thumbnailUrl ? (
                <Image
                    src={occurrence.thumbnailUrl}
                    alt={occurrence.name}
                    className={styles.thumbnail}
                />
            ) : (
                <div className={cn(styles.thumbnail, styles.placeholder)} />
            )}
            <div className={styles.slug}>
                <Form<DiscordEventOccurrence>
                    form={occurrence}
                    readonly={true}
                    title=""
                    className={styles.form}
                >
                    <FormGroup
                        title={occurrence.name}
                        subtitle={formatDiscordEventDate(relevantDate)}
                        defaultCollapsed
                    >
                        <TextField
                            label="Name"
                            getter={() => occurrence.name}
                        />
                        <TextField
                            label="Description"
                            getter={() => occurrence.description}
                        />
                        <FormField label="Status">
                            <div
                                className={cn(
                                    tagStyles.tag,
                                    statusTag[occurrence.status ?? 0]
                                )}
                            >
                                {getStatusName(occurrence.status ?? null)}
                            </div>
                        </FormField>
                        <TextField
                            label="Channel"
                            getter={() => getChannelName(occurrence.channelId)}
                        />
                        <DateField
                            label="Scheduled Start"
                            getter={() => occurrence.scheduledStartUtc}
                        />
                        <DateField
                            label="Scheduled End"
                            getter={() => occurrence.scheduledEndUtc}
                        />
                        <DateField
                            label="Started At"
                            getter={() => occurrence.startedAtUtc}
                        />
                        <DateField
                            label="Ended At"
                            getter={() => occurrence.endedAtUtc}
                        />
                        <FormField label="Attendees">
                            <div className={styles.attendeeList}>
                                {occurrence.attendees &&
                                occurrence.attendees.length > 0
                                    ? occurrence.attendees.map((attendee) => (
                                          <NavigationButton
                                              key={[
                                                  occurrence.id,
                                                  attendee.id,
                                              ].join('__')}
                                              icon={
                                                  <DiscordAvatar
                                                      discordUserId={
                                                          attendee.discordUser!
                                                              .id
                                                      }
                                                      imageId={
                                                          attendee.discordUser!
                                                              .image
                                                      }
                                                      size={32}
                                                  />
                                              }
                                              label={`@${attendee.discordUser!.username}`}
                                              href={`/volunteer_dashboard/panels/members?userId=${attendee.id}`}
                                          />
                                      ))
                                    : 'None'}
                            </div>
                        </FormField>
                    </FormGroup>
                </Form>
            </div>
        </div>
    )
}
