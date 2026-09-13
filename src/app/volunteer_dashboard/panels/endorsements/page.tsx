'use client'

import { EndorsementBanner } from './components/EndorsementBanner'
import { useEndorsementFilters } from './endorsementFilters'
import styles from './page.module.css'
import { DetailView } from './panel_views/DetailView'
import { HistoryView } from './panel_views/HistoryView'
import { FilterTags } from '@/app/admin/layout/FilterTags'
import { MobileSidebarBackButton } from '@/app/volunteer_dashboard/layout/MobileSidebarBackButton'
import { EndorsementAvatar } from '@/components/common'
import { FormState } from '@/components/common/forms'
import Panel from '@/components/common/panel/Panel'
import { SidebarBody } from '@/components/common/panel/sidebar_list/SidebarBody'
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
import {
    useOptimisticDelete,
    useOptimisticUpdate,
    useUnpaginatedSearch,
} from '@/util/hooks'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useMediaQuery } from 'usehooks-ts'

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

const electionDateFormat = Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeZone: 'UTC',
})

const makeDateTag = (endorsement: Endorsement) => {
    const electionDate = getRelevantElectionDate(endorsement)
    if (!electionDate) return undefined

    return electionDateFormat.format(electionDate)
}

const endorsementLevelTagClass: Record<EndorsementType, string | undefined> = {
    [EndorsementType.PVPledge]: styles.tagPurple,
    [EndorsementType.Endorsement]: styles.tagGreen,
    [EndorsementType.Recommendation]: styles.tagRed,
    [EndorsementType.Unendorsed]: undefined,
    [EndorsementType.None]: styles.tagDefault,
}

const initiativeLevelTagClass: Record<InitiativeType, string | undefined> = {
    [InitiativeType.State]: styles.tagOrange,
    [InitiativeType.National]: styles.tagBlue,
    [InitiativeType.None]: styles.tagDefault,
}

const makeLevelTags = (endorsement: Endorsement) => [
    {
        label: ENDORSEMENT_TYPE_LABELS[endorsement.endorsementLevel],
        className: endorsementLevelTagClass[endorsement.endorsementLevel],
    },
    {
        label: INITIATIVE_TYPE_LABELS[endorsement.initiativeLevel],
        className: initiativeLevelTagClass[endorsement.initiativeLevel],
    },
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
    const [sidebarMobileVisible, setSidebarMobileVisible] = useState(true)
    const isDesktop = useMediaQuery('(min-width: 64rem)')

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
        initialSearch: {
            sort: SortDirection.ASC,
            sortField: 'name',
            limit: 25,
        },
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
        if (value.id === selectedEndorsement?.id) return true

        if (formState?.mode === 'edit' || formState?.mode === 'create') {
            const proceed = confirm(
                'Are you sure you want to continue? All progress will be lost.'
            )
            if (!proceed) return false
        }

        setFormState(null)
        setSelectedEndorsement(value)
        setSelectedTab('detail')
        return true
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
        <Panel
            includeSidebar
            collapsedSidebarMode="compact"
            sidebarTogglePlacement="header"
            showSidebarFooterWhenCollapsed={false}
            showSidebarBorderWhenCollapsed
            largeTitle
            sidebarWidth="25.5rem"
            collapsedSidebarWidth="5rem"
            sidebarClassName={styles.sidebarBg}
            sidebarMobileVisible={isDesktop || sidebarMobileVisible}
            label="Endorsements"
            showScrollbar={false}
            sidebarList={{
                search: { search, onSearch },
                footer: {
                    page: search.page ?? 0,
                    pageSize: search.limit ?? 25,
                    count: endorsementCount,
                    isPending: endorsementsQuery.isPending,
                    onPageChange: (nextPage: number) =>
                        onSearch({ ...search, page: nextPage }),
                },
                filters: {
                    search,
                    onSearch,
                    sortFieldOptions: endorsementSortFields,
                    showSort: true,
                    showLimit: true,
                },
            }}
            sidebarBody={
                <>
                    <div className={styles.filterTagsWrapper}>
                        <FilterTags
                            tags={endorsementFilterTags}
                            activeTag={activeFilterTag}
                            onChange={setActiveFilterTag}
                        />
                    </div>
                    <SidebarBody<Endorsement>
                        items={endorsements}
                        isLoading={endorsementsQuery.isPending}
                        error={endorsementsQuery.error}
                        selectedKey={selectedEndorsement?.id}
                        renderItem={(item) => ({
                            key: item.id,
                            label: `${item.name}${item.incumbent ? '*' : ''}`,
                            subtitle: getStateLabel(item.state),
                            tagLabel: makeDateTag(item),
                            tagClassName: styles.dateTag,
                            subTags: makeLevelTags(item),
                            icon: (
                                <EndorsementAvatar
                                    endorsement={item}
                                    size={40}
                                    badgeTooltipPosition="bottom"
                                    className={styles.listAvatar}
                                />
                            ),
                            href: `/volunteer_dashboard/panels/endorsements?endorsementId=${item.id}`,
                            onClick: (event) => {
                                event.preventDefault()
                                const selected = handleSelectItem(item)
                                if (selected && !isDesktop) {
                                    setSidebarMobileVisible(false)
                                }
                            },
                        })}
                    />
                </>
            }
        >
            <div className={styles.detailsPane}>
                <MobileSidebarBackButton
                    label="Endorsements"
                    sidebarMobileVisible={isDesktop || sidebarMobileVisible}
                    onBack={() => setSidebarMobileVisible(true)}
                    className={styles.backButton}
                />

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
        </Panel>
    )
}
