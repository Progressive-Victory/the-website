'use client'

import { EndorsementAvatar } from './components/EndorsementAvatar'
import { EndorsementBanner } from './components/EndorsementBanner'
import styles from './page.module.css'
import { DetailView } from './panel_views/DetailView'
import { HistoryView } from './panel_views/HistoryView'
import { FilterTag, FilterTags } from '@/app/admin/layout/FilterTags'
import { ListElement, List } from '@/app/admin/layout/List'
import { FormState } from '@/components/common/forms'
import { TabSpec } from '@/components/common/tab_bar/TabBar'
import {
    BackgroundColor,
    Endorsement,
    ElectionStatus,
    EndorsementType,
    InitiativeType,
} from '@/contracts/data'
import { SortDirection } from '@/contracts/requests'
import { stateOptions } from '@/models'
import { useEndorsementQueries } from '@/queries'
import { cn } from '@/util'
import {
    useOptimisticDelete,
    useOptimisticUpdate,
    useUnpaginatedSearch,
} from '@/util/hooks'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { FaClipboard, FaThumbsUp, FaUsers, FaVoteYea } from 'react-icons/fa'
import { FaClipboardUser } from 'react-icons/fa6'
import { MdVerified } from 'react-icons/md'

const blankEndorsement: Endorsement = {
    id: -1,
    name: '',
    state: '',
    jurisdiction: null,
    endorsementDate: null,
    endorsementReason: '',
    endorsementPublished: false,
    incumbent: false,
    handleHref: null,
    handle: '',
    quote: '',
    websiteHref: '',
    donateHref: null,
    isPvMember: false,
    imgUrl: '',
    primaryElectionDate: null,
    generalElectionDate: null,
    initiativeLevel: InitiativeType.None,
    endorsementLevel: EndorsementType.None,
    avatarBgColor: BackgroundColor.Blue,
    electionStatus: ElectionStatus.NoElection,
}

const stateNames = new Map(
    stateOptions.map((option) => [option.value, option.label])
)

const alwaysShowPrimaryDate = new Set([
    ElectionStatus.LostPrimary,
    ElectionStatus.DroppedOut,
    ElectionStatus.NoElection,
])

function getListElectionDate(endorsement: Endorsement) {
    const { primaryElectionDate, generalElectionDate, electionStatus } =
        endorsement
    if (alwaysShowPrimaryDate.has(electionStatus)) return primaryElectionDate
    if (primaryElectionDate && primaryElectionDate >= new Date())
        return primaryElectionDate
    return generalElectionDate ?? primaryElectionDate
}

const initiativeLevelOptions = [
    { value: InitiativeType.State, label: 'State Initiative' },
    { value: InitiativeType.National, label: 'National Initiative' },
    { value: InitiativeType.None, label: 'None' },
]

const endorsementLevelOptions = [
    { value: EndorsementType.PVPledge, label: 'PV Pledge' },
    { value: EndorsementType.Endorsement, label: 'Endorsement' },
    { value: EndorsementType.Recommendation, label: 'Recommendation' },
    { value: EndorsementType.Unendorsed, label: 'Unendorsed' },
    { value: EndorsementType.None, label: 'None' },
]

const endorsementSortFields = [
    { value: 'name', label: 'Name' },
    { value: 'primaryElectionDate', label: 'Primary Date' },
    { value: 'generalElectionDate', label: 'General Date' },
]

const endorsementFilterTags: FilterTag[] = [
    {
        key: 'endorsement_level',
        label: 'Endorsement Tier',
        icon: <FaThumbsUp />,
        color: '#5997E0',
        width: '11.65rem',
        activeRedirect: 'all',
        scrollLeft: 'members',
        scrollRight: 'all',
    },
    {
        key: 'endorsement_status',
        label: 'Election Status',
        icon: <FaVoteYea />,
        color: '#62A46C',
        width: '11.65rem',
        activeRedirect: 'all',
        scrollLeft: 'endorsement_level',
        scrollRight: 'all',
    },
    {
        key: 'initiative_level',
        label: 'Initiatives',
        icon: <FaClipboard />,
        color: '#7674B3',
        width: '11.65rem',
        activeRedirect: 'all',
        scrollLeft: 'endorsement_level',
        scrollRight: 'all',
    },
    {
        key: 'isMember',
        label: 'PV Members',
        icon: <FaClipboardUser />,
        color: '#C65882',
        width: '11.65rem',
        activeRedirect: 'all',
        scrollLeft: 'endorsement_level',
        scrollRight: 'all',
    },
    {
        key: 'all',
        label: 'All Items',
        icon: <FaUsers />,
        color: '#3A3A3C',
        width: '8.4rem',
        activeRedirect: 'endorsement_level',
        scrollLeft: 'endorsement_level',
        scrollRight: 'all',
    },
]

function matchesFilterTag(endorsement: Endorsement, tag: string) {
    if (tag === 'isMember') return endorsement.isPvMember

    return true
}

type EndorsementTabKey = 'detail' | 'history'

const endorsementTabs: TabSpec[] = [
    { key: 'detail', label: 'Detail' },
    { key: 'history', label: 'History' },
]

export default function Page() {
    const queryClient = useQueryClient()
    const endorsementQueries = useEndorsementQueries()

    const [selectedEndorsement, setSelectedEndorsement] =
        useState<Endorsement | null>(null)
    const [formState, setFormState] = useState<FormState<Endorsement> | null>(
        null
    )
    const [selectedTab, setSelectedTab] = useState<EndorsementTabKey>('detail')

    const endorsementsQuery = useQuery({
        queryKey: ['endorsements'],
        queryFn: ({ signal }) => endorsementQueries.getEndorsements({ signal }),
        enabled: endorsementQueries.ready,
    })

    const [activeFilterTag, setActiveFilterTag] = useState('all')

    const {
        items: endorsements,
        count: endorsementCount,
        search,
        onSearch,
    } = useUnpaginatedSearch({
        items: (endorsementsQuery.data ?? []).filter((endorsement) =>
            matchesFilterTag(endorsement, activeFilterTag)
        ),
        initialSearch: { sort: SortDirection.ASC, sortField: 'name' },
        onFilter: (endorsement, query) =>
            endorsement.name
                .toLocaleLowerCase()
                .includes(query.toLocaleLowerCase()),
        onSort: (a, b, field) => {
            if (
                field === 'primaryElectionDate' ||
                field === 'generalElectionDate'
            ) {
                const aDate =
                    (field === 'primaryElectionDate'
                        ? a.primaryElectionDate
                        : a.generalElectionDate
                    )?.getTime() ?? 0
                const bDate =
                    (field === 'primaryElectionDate'
                        ? b.primaryElectionDate
                        : b.generalElectionDate
                    )?.getTime() ?? 0
                return aDate - bDate
            }

            return a.name.localeCompare(b.name)
        },
    })

    const updateEndorsementsCache = (id: number, value: Endorsement | null) => {
        queryClient.setQueryData(['endorsements'], (res: Endorsement[]) => {
            const list = [...(res ?? [])]
            const currIndex = list.findIndex((e) => e.id == id)

            if (currIndex >= 0) list.splice(currIndex, 1)
            if (value) list.splice(currIndex >= 0 ? currIndex : 0, 0, value)
            return list
        })
    }

    const handleSelectItem = (value: Endorsement) => {
        if (value.id === selectedEndorsement?.id) return

        if (formState?.mode === 'edit' || formState?.mode === 'create') {
            const proceed = confirm(
                'Are you sure you want to continue? All progress will be lost.'
            )
            if (!proceed) return
        }

        setFormState(null)
        setSelectedEndorsement(value)
        setSelectedTab('detail')
    }

    const createMutation = useOptimisticUpdate<Endorsement>({
        mutationFn: ({ newValue }) =>
            endorsementQueries.createEndorsement(newValue),
        onChange: (value) => {
            setSelectedEndorsement(value)
            updateEndorsementsCache(blankEndorsement.id, value)
        },
    })

    const updateMutation = useOptimisticUpdate<Endorsement>({
        mutationFn: ({ newValue }) =>
            endorsementQueries.updateEndorsement(newValue.id, newValue),
        onChange: (value) => {
            setSelectedEndorsement(value)
            updateEndorsementsCache(value.id, value)
        },
    })

    const deleteMutation = useOptimisticDelete<Endorsement>({
        mutationFn: ({ currentValue }) =>
            endorsementQueries.deleteEndorsement(currentValue.id),
        onChange: (value, { currentValue }) => {
            setSelectedEndorsement(value ?? null)
            updateEndorsementsCache(currentValue.id, value ?? null)
        },
    })

    const handleCreate = () => blankEndorsement

    const handleSave = (newEndorsement: Endorsement) => {
        const originalPublished =
            formState?.mode === 'create'
                ? blankEndorsement.endorsementPublished
                : selectedEndorsement?.endorsementPublished

        if (
            originalPublished !== undefined &&
            newEndorsement.endorsementPublished !== originalPublished
        ) {
            const proceed = confirm(
                newEndorsement.endorsementPublished
                    ? 'You will be publishing this publicly to the endorsement page. Are you sure you want to do that?'
                    : 'This will remove the endorsement from the public endorsement page. Are you sure you want to do that?'
            )
            if (!proceed) return false
        } else if (
            formState?.mode === 'edit' &&
            originalPublished === true &&
            newEndorsement.endorsementPublished
        ) {
            const proceed = confirm(
                'These changes will be reflected on the public endorsement page. Are you sure you want to do that?'
            )
            if (!proceed) return false
        }

        if (formState?.mode === 'create') {
            createMutation.mutate({
                currentValue: blankEndorsement,
                newValue: newEndorsement,
            })
        } else if (selectedEndorsement != null) {
            updateMutation.mutate({
                currentValue: selectedEndorsement,
                newValue: newEndorsement,
            })
        }

        return true
    }

    const handleDelete = () => {
        if (!selectedEndorsement) return

        deleteMutation.mutate({
            currentValue: selectedEndorsement,
            newValue: undefined,
        })
    }

    const handleCancel = () => {
        if (formState?.mode === 'create') {
            setFormState(null)
            setSelectedEndorsement(null)
        }
    }

    return (
        <>
            <div className={styles.listWidth}>
                <List
                    search={search}
                    count={endorsementCount}
                    isPending={endorsementsQuery.isPending}
                    error={endorsementsQuery.error}
                    headerContent={
                        <FilterTags
                            tags={endorsementFilterTags}
                            activeTag={activeFilterTag}
                            onChange={setActiveFilterTag}
                        />
                    }
                    onSearch={onSearch}
                    sortFields={endorsementSortFields}
                >
                    {endorsements.map((item) => {
                        const listDate = getListElectionDate(item)

                        return (
                            <ListElement
                                key={item.id}
                                className={styles.listElement}
                                selected={selectedEndorsement?.id == item.id}
                                onClick={() => handleSelectItem(item)}
                            >
                                <div className={styles.listItemBody}>
                                    <div className={styles.listItemTopRow}>
                                        <EndorsementAvatar
                                            endorsement={item}
                                            size={48}
                                        />
                                        <div className={styles.listItemMeta}>
                                            <span
                                                className={styles.listItemText}
                                            >
                                                {item.name}
                                                {item.incumbent && '*'}
                                                {item.isPvMember && (
                                                    <MdVerified
                                                        className={
                                                            styles.verifiedBadge
                                                        }
                                                        title="PV Member"
                                                    />
                                                )}
                                            </span>
                                            <span
                                                className={
                                                    styles.listItemSubtext
                                                }
                                            >
                                                {stateNames.get(item.state) ??
                                                    item.state}
                                            </span>
                                        </div>
                                        {listDate && (
                                            <span className={styles.stateTag}>
                                                {Intl.DateTimeFormat('en-US', {
                                                    dateStyle: 'medium',
                                                    timeZone: 'UTC',
                                                }).format(listDate)}
                                            </span>
                                        )}
                                    </div>
                                    <div className={styles.levelTags}>
                                        <span
                                            className={cn(
                                                styles.levelTag,
                                                item.endorsementLevel ===
                                                    EndorsementType.PVPledge &&
                                                    styles.tagPurple,
                                                item.endorsementLevel ===
                                                    EndorsementType.Endorsement &&
                                                    styles.tagGreen,
                                                item.endorsementLevel ===
                                                    EndorsementType.Recommendation &&
                                                    styles.tagRed,
                                                item.endorsementLevel ===
                                                    EndorsementType.None &&
                                                    styles.tagDefault
                                            )}
                                        >
                                            {
                                                endorsementLevelOptions.find(
                                                    (option) =>
                                                        option.value ===
                                                        item.endorsementLevel
                                                )?.label
                                            }
                                        </span>
                                        <span
                                            className={cn(
                                                styles.levelTag,
                                                item.initiativeLevel ===
                                                    InitiativeType.State
                                                    ? styles.tagOrange
                                                    : styles.tagBlue
                                            )}
                                        >
                                            {
                                                initiativeLevelOptions.find(
                                                    (option) =>
                                                        option.value ===
                                                        item.initiativeLevel
                                                )?.label
                                            }
                                        </span>
                                    </div>
                                </div>
                            </ListElement>
                        )
                    })}
                </List>
            </div>

            <div className={styles.detailsPane}>
                {selectedEndorsement && (
                    <EndorsementBanner
                        endorsement={formState?.form ?? selectedEndorsement}
                        uploadImage={endorsementQueries.uploadImage}
                        editing={
                            formState?.mode === 'edit' ||
                            formState?.mode === 'create'
                        }
                        saving={
                            createMutation.isPending || updateMutation.isPending
                        }
                        containerClassName={styles.detailsHeader}
                        coverClassName={styles.bannerCover}
                        selectedTab={selectedTab}
                        tabs={endorsementTabs}
                        onTabChange={(key) =>
                            setSelectedTab(key as EndorsementTabKey)
                        }
                    />
                )}
                {selectedTab === 'detail' && (
                    <DetailView
                        key={selectedEndorsement?.id ?? 'empty'}
                        endorsement={
                            formState?.form ?? selectedEndorsement ?? null
                        }
                        title={
                            formState?.mode === 'create'
                                ? formState.form.name ||
                                  'Create New Endorsement'
                                : (formState?.form?.name ??
                                  selectedEndorsement?.name ??
                                  'Endorsement')
                        }
                        saving={
                            createMutation.isPending || updateMutation.isPending
                        }
                        onUpdate={setFormState}
                        onSave={handleSave}
                        onCreate={handleCreate}
                        onDelete={handleDelete}
                        onCancel={handleCancel}
                        uploadImage={endorsementQueries.uploadImage}
                        className={styles.detailsContent}
                    />
                )}
                {selectedEndorsement && selectedTab === 'history' && (
                    <HistoryView />
                )}
            </div>
        </>
    )
}
