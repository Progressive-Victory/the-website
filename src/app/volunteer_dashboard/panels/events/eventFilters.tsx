import styles from '../endorsements/endorsementFilters.module.css'
import { FilterTag } from '@/app/volunteer_dashboard/layout/FilterTags'
import { DropdownOverlay, DropdownOverlayButton } from '@/components/common'
import { YesNoMenu } from '@/components/common/forms/YesNoMenu'
import { dateService } from '@/services'
import { DOT_SEPARATOR } from '@/util'
import { DiscordEventStatus } from 'pv-contracts/data'
import { DiscordEventWithOccurrences } from 'pv-contracts/responses'
import { useState } from 'react'
import { FaCalendarAlt, FaClock, FaUsers, FaVolumeDown } from 'react-icons/fa'
import { FaUser, FaCalendarCheck } from 'react-icons/fa6'

interface Filter<T> {
    value: T
    label: string
}

interface EventFilters {
    status: DiscordEventStatus | null
    channel: string | null
    recurrent: boolean | null
    creatorDiscordId: string | null
}

const matchesFilterTag = (
    event: DiscordEventWithOccurrences,
    tag: string,
    filters: EventFilters
) => {
    if (tag === 'all') {
        return Object.keys(filters).every((filter) =>
            [null, event[filter] ?? newestOccurrence(event)[filter]].includes(
                filters[filter]
            )
        )
    }

    return [null, event[tag] ?? newestOccurrence(event)[tag]].includes(
        filters[tag]
    )
}

function optionDropdown<T>(
    options: Filter<T>[],
    selected: Filter<T> | undefined,
    onSelect: (value: Filter<T> | undefined) => void
): FilterTag['dropdownOverlay'] {
    const CloseDropdown = ({
        closeDropdown,
    }: {
        closeDropdown: () => void
    }) => (
        <DropdownOverlay
            label="Filter by"
            onClose={closeDropdown}
            narrowLayoutMode="trigger"
            style={{ left: 0, right: 'auto' }}
            body={
                <div className={styles.filterMenu}>
                    <DropdownOverlayButton
                        checked={selected === undefined}
                        onClick={() => {
                            onSelect(undefined)
                            closeDropdown()
                        }}
                    >
                        All
                    </DropdownOverlayButton>
                    {options.map((o) => (
                        <DropdownOverlayButton
                            key={String(o.value)}
                            checked={selected === o.value}
                            onClick={() => {
                                onSelect(o)
                                closeDropdown()
                            }}
                        >
                            {o.label}
                        </DropdownOverlayButton>
                    ))}
                </div>
            }
        />
    )
    return CloseDropdown
}

const getDiscordChannelName = (channelId: string) =>
    `${channelId} (Not Implemented)`
const getDiscordUsername = (discordUserId: string) =>
    `${discordUserId} (Not Implemented)`
const newestOccurrence = (event: DiscordEventWithOccurrences) =>
    event.occurrences.toSorted(
        (a, b) => a.scheduledStartUtc.getTime() - b.scheduledStartUtc.getTime()
    )[0]

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

export function useEventFilters(events: DiscordEventWithOccurrences[]) {
    const [activeTag, setActiveTag] = useState('all')

    const [selectedEventStatus, setSelectedEventStatus] =
        useState<Filter<EventFilters['status']>>()
    const [selectedEventChannel, setSelectedEventChannel] =
        useState<Filter<EventFilters['channel']>>()
    const [isSelectedEventRecurrent, setIsSelectedEventRecurrent] =
        useState<Filter<EventFilters['recurrent']>>()
    const [selectedCreatorDiscordId, setSelectedCreatorDiscordId] =
        useState<Filter<EventFilters['creatorDiscordId']>>()

    const selectedFilterLabel =
        [
            selectedEventStatus,
            selectedEventChannel,
            isSelectedEventRecurrent,
            selectedCreatorDiscordId,
        ]
            .filter(
                (filter) =>
                    filter?.value !== null && filter?.value !== undefined
            )
            .map((filter) => filter?.label)
            .join(` ${DOT_SEPARATOR} `) || 'More'
    const selectedFilterIcon = selectedEventStatus ? (
        <FaCalendarCheck />
    ) : selectedEventChannel ? (
        <FaVolumeDown />
    ) : isSelectedEventRecurrent ? (
        <FaClock />
    ) : selectedCreatorDiscordId ? (
        <FaUser />
    ) : (
        <FaUsers />
    )

    const filterOptions = {
        status: [
            { value: DiscordEventStatus.Active, label: 'Active' },
            { value: DiscordEventStatus.Scheduled, label: 'Scheduled' },
            { value: DiscordEventStatus.Completed, label: 'Completed' },
            { value: DiscordEventStatus.Cancelled, label: 'Cancelled' },
        ],
        channel: [
            ...new Set(events.map((e) => newestOccurrence(e).channelId)),
        ].map((channelId) => ({
            value: channelId,
            label: getDiscordChannelName(channelId),
        })),
        recurrent: [
            { value: true, label: 'Yes' },
            { value: false, label: 'No' },
        ],
        creatorDiscordId: [
            ...new Set(events.map((e) => e.creatorDiscordId)),
        ].map((creatorId) => ({
            value: creatorId,
            label: getDiscordUsername(creatorId),
        })),
    }

    const allEventsDropdown = ({
        closeDropdown,
    }: {
        closeDropdown: () => void
    }) => (
        <DropdownOverlay
            label="Filter by"
            onClose={closeDropdown}
            narrowLayoutMode="trigger"
            body={
                <div className={styles.filterMenu}>
                    <DropdownOverlayButton
                        icon={<FaCalendarAlt />}
                        checked={
                            selectedEventStatus === undefined &&
                            selectedEventChannel === undefined &&
                            isSelectedEventRecurrent === undefined &&
                            selectedCreatorDiscordId === undefined
                        }
                        onClick={() => {
                            setSelectedEventStatus(undefined)
                            setSelectedEventChannel(undefined)
                            setIsSelectedEventRecurrent(undefined)
                            setSelectedCreatorDiscordId(undefined)
                            closeDropdown()
                        }}
                    >
                        All Items
                    </DropdownOverlayButton>
                    <DropdownOverlayButton
                        icon={<FaCalendarCheck />}
                        selected={selectedEventStatus !== undefined}
                        menu={({ closeMenu }) => (
                            <div className={styles.nestedFilterMenu}>
                                {filterOptions.status.map((status) => (
                                    <DropdownOverlayButton
                                        key={status.value}
                                        checked={selectedEventStatus === status}
                                        onClick={() => {
                                            setSelectedEventStatus(status)
                                            setSelectedEventChannel(undefined)
                                            setSelectedCreatorDiscordId(
                                                undefined
                                            )
                                            closeMenu()
                                            closeDropdown()
                                        }}
                                    >
                                        {status.label}
                                    </DropdownOverlayButton>
                                ))}
                            </div>
                        )}
                    >
                        Status
                    </DropdownOverlayButton>
                    <DropdownOverlayButton
                        icon={<FaVolumeDown />}
                        selected={selectedEventChannel !== undefined}
                        menu={({ closeMenu }) => (
                            <div className={styles.nestedFilterMenu}>
                                {filterOptions.channel.map((channel) => (
                                    <DropdownOverlayButton
                                        key={channel.value}
                                        checked={
                                            selectedEventChannel === channel
                                        }
                                        onClick={() => {
                                            setSelectedEventStatus(undefined)
                                            setSelectedEventChannel(channel)
                                            setSelectedCreatorDiscordId(
                                                undefined
                                            )
                                            closeMenu()
                                            closeDropdown()
                                        }}
                                    >
                                        {channel.label}
                                    </DropdownOverlayButton>
                                ))}
                            </div>
                        )}
                    >
                        Channel
                    </DropdownOverlayButton>
                    <DropdownOverlayButton
                        icon={<FaClock />}
                        selected={isSelectedEventRecurrent !== undefined}
                        menu={({ closeMenu }) => (
                            <YesNoMenu
                                selected={
                                    isSelectedEventRecurrent?.value ?? null
                                }
                                onSelect={(value) => {
                                    setIsSelectedEventRecurrent({
                                        value,
                                        label: value ? 'Yes' : 'No',
                                    })
                                    closeMenu()
                                    closeDropdown()
                                }}
                            />
                        )}
                    >
                        Recurrent
                    </DropdownOverlayButton>
                    <DropdownOverlayButton
                        icon={<FaUser />}
                        selected={selectedCreatorDiscordId !== undefined}
                        menu={({ closeMenu }) => (
                            <div className={styles.nestedFilterMenu}>
                                {filterOptions.creatorDiscordId.map(
                                    (creator) => (
                                        <DropdownOverlayButton
                                            key={creator.value}
                                            checked={
                                                selectedCreatorDiscordId ===
                                                creator
                                            }
                                            onClick={() => {
                                                setSelectedEventStatus(
                                                    undefined
                                                )
                                                setSelectedEventChannel(
                                                    undefined
                                                )
                                                setSelectedCreatorDiscordId(
                                                    creator
                                                )
                                                closeMenu()
                                                closeDropdown()
                                            }}
                                        >
                                            {creator.label}
                                        </DropdownOverlayButton>
                                    )
                                )}
                            </div>
                        )}
                    >
                        Creator
                    </DropdownOverlayButton>
                </div>
            }
        />
    )

    const tags: FilterTag[] = [
        {
            key: 'status',
            label:
                filterOptions.status.find(
                    (o) => o.value === selectedEventStatus?.value
                )?.label ?? 'All Events',
            icon: <FaCalendarCheck />,
            color: '#5997E0',
            width: '10rem',
            activeRedirect: 'all',
            scrollLeft: 'members',
            scrollRight: 'all',
            dropdownOverlay: optionDropdown(
                filterOptions.status,
                selectedEventStatus,
                setSelectedEventStatus
            ),
        },
        {
            key: 'channel',
            label:
                filterOptions.channel.find(
                    (o) => o.value === selectedEventChannel?.value
                )?.label ?? 'Channel',
            icon: <FaVolumeDown />,
            color: '#62A46C',
            width: '10rem',
            activeRedirect: 'all',
            scrollLeft: 'status',
            scrollRight: 'all',
            dropdownOverlay: optionDropdown(
                filterOptions.channel,
                selectedEventChannel,
                setSelectedEventChannel
            ),
        },
        {
            key: 'recurrent',
            label:
                filterOptions.recurrent.find(
                    (o) => o.value === isSelectedEventRecurrent?.value
                )?.label ?? 'Recurrent',
            icon: <FaClock />,
            color: '#C65882',
            width: '10rem',
            activeRedirect: 'all',
            scrollLeft: 'channel',
            scrollRight: 'all',
            dropdownOverlay: optionDropdown(
                filterOptions.recurrent,
                isSelectedEventRecurrent,
                setIsSelectedEventRecurrent
            ),
        },

        {
            key: 'creatorDiscordId',
            label:
                filterOptions.creatorDiscordId.find(
                    (o) => o.value === selectedCreatorDiscordId?.value
                )?.label ?? 'Creator',
            icon: <FaUser />,
            color: '#7674B3',
            width: '10rem',
            activeRedirect: 'all',
            scrollLeft: 'channel',
            scrollRight: 'all',
            dropdownOverlay: optionDropdown(
                filterOptions.creatorDiscordId,
                selectedCreatorDiscordId,
                setSelectedCreatorDiscordId
            ),
        },
        {
            key: 'all',
            label: selectedFilterLabel,
            icon: selectedFilterIcon,
            color: '#3A3A3C',
            width: '8rem',
            activeRedirect: 'status',
            scrollLeft: 'status',
            scrollRight: 'all',
            dropdownOverlay: allEventsDropdown,
        },
    ]

    const filtered = events.filter((event) =>
        matchesFilterTag(event, activeTag, {
            status: selectedEventStatus?.value ?? null,
            channel: selectedEventChannel?.value ?? null,
            recurrent: isSelectedEventRecurrent?.value ?? null,
            creatorDiscordId: selectedCreatorDiscordId?.value ?? null,
        })
    )

    return { tags, activeTag, setActiveTag, filtered }
}
