'use client'

import { EndorsementBanner } from './components/EndorsementBanner'
import { useEndorsementFilters } from './endorsementFilters'
import styles from './page.module.css'
import { DetailView } from './panel_views/DetailView'
import { HistoryView } from './panel_views/HistoryView'
import { FilterTags } from '@/app/admin/layout/FilterTags'
import { ListElement, List } from '@/app/admin/layout/List'
import { EndorsementAvatar } from '@/components/common'
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
import {
    ENDORSEMENT_TYPE_LABELS,
    INITIATIVE_TYPE_LABELS,
    getRelevantElectionDate,
    getStateLabel,
} from '@/models'
import { useEndorsementQueries } from '@/queries'
import { cn } from '@/util'
import {
    useOptimisticDelete,
    useOptimisticUpdate,
    useUnpaginatedSearch,
} from '@/util/hooks'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
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
    handle: null,
    quote: null,
    websiteHref: null,
    donateHref: null,
    isPvMember: false,
    imgHref: null,
    primaryElectionDate: null,
    generalElectionDate: null,
    initiativeLevel: InitiativeType.None,
    endorsementLevel: EndorsementType.None,
    avatarBgColor: BackgroundColor.Blue,
    electionStatus: ElectionStatus.NoElection,
}

const endorsementSortFields = [
    { value: 'name', label: 'Name' },
    { value: 'primaryElectionDate', label: 'Primary Date' },
    { value: 'generalElectionDate', label: 'General Date' },
]

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

    const {
        tags: endorsementFilterTags,
        activeTag: activeFilterTag,
        setActiveTag: setActiveFilterTag,
        filteredEndorsements,
    } = useEndorsementFilters(endorsementsQuery.data ?? [])

    const {
        items: endorsements,
        count: endorsementCount,
        search,
        onSearch,
    } = useUnpaginatedSearch({
        items: filteredEndorsements,
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

        const proceed = confirm(
            selectedEndorsement.endorsementPublished
                ? `This will permanently delete ${selectedEndorsement.name} and remove them from the public endorsement page. Are you sure you want to do that?`
                : `This will permanently delete ${selectedEndorsement.name}. Are you sure you want to do that?`
        )
        if (!proceed) return

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

    // Uploads only work on the instance the Form hydrates via `beforeHeader`,
    // since that is what wires the avatar back into form state.
    const renderBanner = (formConnected: boolean) =>
        selectedEndorsement ? (
            <EndorsementBanner
                endorsement={formState?.form ?? selectedEndorsement}
                uploadImage={
                    formConnected ? endorsementQueries.uploadImage : undefined
                }
                editing={
                    formState?.mode === 'edit' || formState?.mode === 'create'
                }
                saving={createMutation.isPending || updateMutation.isPending}
                containerClassName={styles.detailsHeader}
                coverClassName={styles.bannerCover}
                selectedTab={selectedTab}
                tabs={endorsementTabs}
                onTabChange={(key) => setSelectedTab(key as EndorsementTabKey)}
            />
        ) : undefined

    return (
        <>
            <div className={styles.listWidth}>
                <List
                    search={search}
                    count={endorsementCount}
                    isPending={endorsementsQuery.isPending}
                    error={endorsementsQuery.error}
                    headerContent={
                        <div className={styles.filterTagsWrapper}>
                            <FilterTags
                                tags={endorsementFilterTags}
                                activeTag={activeFilterTag}
                                onChange={setActiveFilterTag}
                            />
                        </div>
                    }
                    onSearch={onSearch}
                    sortFields={endorsementSortFields}
                >
                    {endorsements.map((item) => {
                        const listDate = getRelevantElectionDate(item)

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
                                            badgeTooltipPosition="bottom"
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
                                                {getStateLabel(item.state)}
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
                                                ENDORSEMENT_TYPE_LABELS[
                                                    item.endorsementLevel
                                                ]
                                            }
                                        </span>
                                        <span
                                            className={cn(
                                                styles.levelTag,
                                                item.initiativeLevel ===
                                                    InitiativeType.State &&
                                                    styles.tagOrange,
                                                item.initiativeLevel ===
                                                    InitiativeType.National &&
                                                    styles.tagBlue,
                                                item.initiativeLevel ===
                                                    InitiativeType.None &&
                                                    styles.tagDefault
                                            )}
                                        >
                                            {
                                                INITIATIVE_TYPE_LABELS[
                                                    item.initiativeLevel
                                                ]
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
                {selectedTab !== 'detail' && renderBanner(false)}
                {selectedTab === 'detail' && (
                    <DetailView
                        key={selectedEndorsement?.id ?? 'empty'}
                        beforeHeader={renderBanner(true)}
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
