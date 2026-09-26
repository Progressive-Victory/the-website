import { YesNoMenu } from '../endorsements/endorsementFilters'
import styles from '../endorsements/endorsementFilters.module.css'
import { FilterTag } from '@/app/volunteer_dashboard/layout/FilterTags'
import { DropdownOverlay, DropdownOverlayButton } from '@/components/common'
import { DOT_SEPARATOR } from '@/util'
import { DiscordEventStatus } from 'pv-contracts/data'
import { DiscordEventWithOccurrences } from 'pv-contracts/responses'
import { useState } from 'react'
import { FaCalendarAlt, FaGrinSquintTears } from 'react-icons/fa'
import { Fa0, Fa1, Fa2, Fa3, Fa4 } from 'react-icons/fa6'

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
        Object.keys(filters).forEach((filter) => {
            if (
                [null, event[tag] ?? newestOccurence(event)[tag]].includes(
                    filters[filter]
                )
            )
                return false
        })
        return true
    }

    return [null, event[tag] ?? newestOccurence(event)[tag]].includes(
        filters[tag]
    )
}

function optionDropdown<T>(
    options: { value: T; label: string }[],
    selected: T | null,
    onSelect: (value: T | null) => void
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
                        checked={selected === null}
                        onClick={() => {
                            onSelect(null)
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
                                onSelect(o.value)
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
const newestOccurence = (event: DiscordEventWithOccurrences) =>
    event.occurrences.toSorted(
        (a, b) => a.scheduledStartUtc.getTime() - b.scheduledStartUtc.getTime()
    )[0]

export function useEventFilters(events: DiscordEventWithOccurrences[]) {
    const [activeTag, setActiveTag] = useState('all')

    const [selectedEventStatus, setSelectedEventStatus] =
        useState<EventFilters['status']>(null)
    const [selectedEventChannel, setSelectedEventChannel] =
        useState<EventFilters['channel']>(null)
    const [isSelectedEventRecurrent, setIsSelectedEventRecurrent] =
        useState<EventFilters['recurrent']>(null)
    const [selectedCreatorDiscordId, setSelectedCreatorDiscordId] =
        useState<EventFilters['creatorDiscordId']>(null)

    const selectedFilterLabel =
        [
            selectedEventStatus,
            selectedEventChannel,
            isSelectedEventRecurrent,
            selectedCreatorDiscordId,
        ]
            .filter(Boolean)
            .join(` ${DOT_SEPARATOR} `) || 'More'
    const selectedFilterIcon = selectedEventStatus ? (
        <Fa1 />
    ) : selectedEventChannel ? (
        <Fa2 />
    ) : isSelectedEventRecurrent ? (
        <Fa3 />
    ) : selectedCreatorDiscordId ? (
        <Fa4 />
    ) : (
        <Fa0 />
    )

    const filterOptions = {
        status: [
            { value: DiscordEventStatus.Active, label: 'Active' },
            { value: DiscordEventStatus.Scheduled, label: 'Scheduled' },
            { value: DiscordEventStatus.Completed, label: 'Completed' },
            { value: DiscordEventStatus.Cancelled, label: 'Cancelled' },
        ],
        channel: [
            ...new Set(events.map((e) => newestOccurence(e).channelId)),
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
                            selectedEventStatus === null &&
                            selectedEventChannel === null &&
                            isSelectedEventRecurrent === null &&
                            selectedCreatorDiscordId === null
                        }
                        onClick={() => {
                            setSelectedEventStatus(null)
                            setSelectedEventChannel(null)
                            setIsSelectedEventRecurrent(null)
                            setSelectedCreatorDiscordId(null)
                            closeDropdown()
                        }}
                    >
                        All Items
                    </DropdownOverlayButton>
                    <DropdownOverlayButton
                        icon={<Fa1 />}
                        selected={selectedEventStatus !== null}
                        menu={({ closeMenu }) => (
                            <div className={styles.nestedFilterMenu}>
                                {filterOptions.status.map((status) => (
                                    <DropdownOverlayButton
                                        key={status.value}
                                        checked={
                                            selectedEventStatus === status.value
                                        }
                                        onClick={() => {
                                            setSelectedEventStatus(status.value)
                                            setSelectedEventChannel(null)
                                            setSelectedCreatorDiscordId(null)
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
                        icon={<Fa2 />}
                        selected={selectedEventChannel !== null}
                        menu={({ closeMenu }) => (
                            <div className={styles.nestedFilterMenu}>
                                {filterOptions.channel.map((channel) => (
                                    <DropdownOverlayButton
                                        key={channel.value}
                                        checked={
                                            selectedEventChannel ===
                                            channel.value
                                        }
                                        onClick={() => {
                                            setSelectedEventStatus(null)
                                            setSelectedEventChannel(
                                                channel.value
                                            )
                                            setSelectedCreatorDiscordId(null)
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
                        icon={<Fa3 />}
                        selected={isSelectedEventRecurrent !== null}
                        menu={({ closeMenu }) => (
                            <YesNoMenu
                                selected={isSelectedEventRecurrent}
                                onSelect={(value) => {
                                    setIsSelectedEventRecurrent(value)
                                    closeMenu()
                                    closeDropdown()
                                }}
                            />
                        )}
                    >
                        Recurrent
                    </DropdownOverlayButton>
                    <DropdownOverlayButton
                        icon={<Fa4 />}
                        selected={selectedCreatorDiscordId !== null}
                        menu={({ closeMenu }) => (
                            <div className={styles.nestedFilterMenu}>
                                {filterOptions.creatorDiscordId.map(
                                    (creator) => (
                                        <DropdownOverlayButton
                                            key={creator.value}
                                            checked={
                                                selectedCreatorDiscordId ===
                                                creator.value
                                            }
                                            onClick={() => {
                                                setSelectedEventStatus(null)
                                                setSelectedEventChannel(null)
                                                setSelectedCreatorDiscordId(
                                                    creator.value
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
                    (o) => o.value === selectedEventStatus
                )?.label ?? 'All Events',
            icon: <FaGrinSquintTears />,
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
                    (o) => o.value === selectedEventChannel
                )?.label ?? 'Channel',
            icon: <FaGrinSquintTears />,
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
                    (o) => o.value === isSelectedEventRecurrent
                )?.label ?? 'Recurrent',
            icon: <FaGrinSquintTears />,
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
                    (o) => o.value === selectedCreatorDiscordId
                )?.label ?? 'Creator',
            icon: <FaGrinSquintTears />,
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
            status: selectedEventStatus,
            channel: selectedEventChannel,
            recurrent: isSelectedEventRecurrent,
            creatorDiscordId: selectedCreatorDiscordId,
        })
    )

    return { tags, activeTag, setActiveTag, filtered }
}
