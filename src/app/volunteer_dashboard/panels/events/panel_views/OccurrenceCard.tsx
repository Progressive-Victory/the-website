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

    // TODO: Implement this in the API (cache ID + stats to table)
    const getChannelName = (channelId: string) => {
        const channelMap: Record<string, string> = {
            '1153398945695924254': '⛱️ Leadership Lounge',
            '1161032457932521702': '🔹 Junior Leadership',
            '1410396846475706408': '🔸 Leadership HQ 1',
            '1410396711595020308': '🔸 Leadership HQ 2',
            '1312602031139061870': '💼 Office Hours',
            '1001555729292992562': '🏟️ Main Stage',
            '1004495054523617360': '🏢 Organizing HQ 1',
            '1382739680428167250': '🏢 Organizing HQ 2',
            '1019969298577506415': '☎️ Phonebank VC 1',
            '1312592785739747439': '☎️ Phonebank VC 2',
            '928709708188102686': 'Community VC 1',
            '928709708188102687': 'Community VC 2',
            '1532102206038216926': 'Community VC 3',
            '1532102158340849684': 'Community VC 4',
            '1532102082008580368': 'Community VC 5',
            '1312592743729594490': 'Organizing VC 1',
            '1532102268013510676': 'Organizing VC 2',
            '1532102283737829386': 'Organizing VC 3',
            '928709707936456771': '🌴 Community Lounge',
            '1532102443435950252': '🌐 News & Politics',
            '1007800638933053450': '🍺 After Hours (18+)',
            '1063235506999140432': '🎮 Gaming VC 1',
            '1532102386745606195': '🎮 Gaming VC 2',
            '1044057191994368020': '📚 Study Buddies',
        } as const
        return Object.keys(channelMap).includes(channelId)
            ? channelMap[channelId]
            : channelId
    }

    return (
        <div className={styles.card}>
            {occurrence.thumbnailUrl ? (
                <Image
                    src={occurrence.thumbnailUrl}
                    alt={occurrence.name}
                    width={807}
                    height={323}
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
                        <FormField
                            label="Ended At"
                            getter={() =>
                                occurrence.endedAtUtc?.toLocaleTimeString() ??
                                (occurrence.startedAtUtc
                                    ? 'In progress'
                                    : 'Not started')
                            }
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
