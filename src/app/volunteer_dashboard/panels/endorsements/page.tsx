'use client'

import { EndorsementBanner } from './components/EndorsementBanner'
import { useEndorsementFilters } from './endorsementFilters'
import styles from './page.module.css'
import { DetailView } from './panel_views/DetailView'
import { HistoryView } from './panel_views/HistoryView'
import { FilterTags } from '@/app/volunteer_dashboard/layout/FilterTags'
import { MobileSidebarBackButton } from '@/app/volunteer_dashboard/layout/MobileSidebarBackButton'
import { EndorsementAvatar, SearchBar } from '@/components/common'
import {
    DropdownButton,
    DropdownOverlay,
    DropdownOverlayButton,
    ToggleGroup,
} from '@/components/common'
import { FormState } from '@/components/common/forms'
import { PanelBackButton } from '@/components/common/navigation_stack/detail/PanelBackButton'
import Panel from '@/components/common/panel/Panel'
import { SidebarBody } from '@/components/common/panel/sidebar_list/SidebarBody'
import { SidebarListFilters } from '@/components/common/panel/sidebar_list/SidebarList'
import { TabSpec } from '@/components/common/tab_bar/TabBar'
import { Table, type Column } from '@/components/common/table'
import {
    ENDORSEMENT_TYPE_LABELS,
    INITIATIVE_TYPE_LABELS,
    getRelevantElectionDate,
    getStateLabel,
} from '@/models'
import { useEndorsementQueries } from '@/queries'
import { cn } from '@/util'
import {
    useInfiniteScroll,
    useOptimisticDelete,
    useOptimisticUpdate,
    useUnpaginatedSearch,
} from '@/util/hooks'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
    BackgroundColor,
    Endorsement,
    ElectionStatus,
    EndorsementType,
    InitiativeType,
} from 'pv-contracts/data'
import { SortDirection } from 'pv-contracts/requests'
import { useEffect, useRef, useState } from 'react'
import { FaList, FaColumns, FaEdit, FaSave, FaTimes } from 'react-icons/fa'
import { FiGrid } from 'react-icons/fi'
import { IoMdOptions } from 'react-icons/io'
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
type EndorsementView = 'list' | 'table'

const ENDORSEMENT_VIEW_STORAGE_KEY = 'endorsements.panelView'

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
    [EndorsementType.Unendorsed]: styles.tagDarkRed,
    [EndorsementType.None]: styles.tagDefault,
}

const initiativeLevelTagClass: Record<InitiativeType, string | undefined> = {
    [InitiativeType.State]: styles.tagOrange,
    [InitiativeType.National]: styles.tagBlue,
    [InitiativeType.None]: styles.tagDefault,
}

const makeLevelTags = (endorsement: Endorsement) => [
    {
        label:
            endorsement.endorsementLevel === EndorsementType.None
                ? 'No Endorsement'
                : ENDORSEMENT_TYPE_LABELS[endorsement.endorsementLevel],
        className: cn(
            styles.sidebarLevelTag,
            endorsementLevelTagClass[endorsement.endorsementLevel]
        ),
    },
    {
        label:
            endorsement.initiativeLevel === InitiativeType.None
                ? 'No Initiative'
                : INITIATIVE_TYPE_LABELS[endorsement.initiativeLevel],
        className: cn(
            styles.sidebarLevelTag,
            initiativeLevelTagClass[endorsement.initiativeLevel]
        ),
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
    const [endorsementView, setEndorsementView] =
        useState<EndorsementView>('list')
    const hasLoadedEndorsementView = useRef(false)
    const [showTableZebra, setShowTableZebra] = useState(true)
    const [tableVisibleCount, setTableVisibleCount] = useState(25)
    const [isTableEditing, setIsTableEditing] = useState(false)
    const [tableDrafts, setTableDrafts] = useState<Record<number, Endorsement>>(
        {}
    )
    const [sidebarMobileVisible, setSidebarMobileVisible] = useState(true)
    const isDesktop = useMediaQuery('(min-width: 64rem)')

    useEffect(() => {
        try {
            const storedView = window.localStorage.getItem(
                ENDORSEMENT_VIEW_STORAGE_KEY
            )
            if (storedView === 'list' || storedView === 'table')
                setEndorsementView(storedView)
        } catch {
            console.error('Failed to load endorsement view from localStorage')
        }
    }, [])

    useEffect(() => {
        if (!hasLoadedEndorsementView.current) {
            hasLoadedEndorsementView.current = true
            return
        }

        try {
            window.localStorage.setItem(
                ENDORSEMENT_VIEW_STORAGE_KEY,
                endorsementView
            )
        } catch {
            console.error('Failed to save endorsement view to localStorage')
        }
    }, [endorsementView])

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

    const tableSource = [...filteredEndorsements]
        .filter((endorsement) =>
            endorsement.name
                .toLocaleLowerCase()
                .includes((search.query ?? '').toLocaleLowerCase())
        )
        .sort((first, second) => {
            if (
                search.sortField === 'primaryElectionDate' ||
                search.sortField === 'generalElectionDate'
            ) {
                const firstDate =
                    (search.sortField === 'primaryElectionDate'
                        ? first.primaryElectionDate
                        : first.generalElectionDate
                    )?.getTime() ?? 0
                const secondDate =
                    (search.sortField === 'primaryElectionDate'
                        ? second.primaryElectionDate
                        : second.generalElectionDate
                    )?.getTime() ?? 0
                return search.sort === SortDirection.DESC
                    ? secondDate - firstDate
                    : firstDate - secondDate
            }

            const comparison = first.name.localeCompare(second.name)
            return search.sort === SortDirection.DESC ? -comparison : comparison
        })
    const tableEndorsements = tableSource.slice(0, tableVisibleCount)
    const tableHasNextPage = tableVisibleCount < tableSource.length
    const { sentinelRef: tableSentinelRef } = useInfiniteScroll<HTMLDivElement>(
        {
            hasNextPage: tableHasNextPage,
            isFetchingNextPage: false,
            fetchNextPage: () =>
                setTableVisibleCount((count) => count + (search.limit ?? 25)),
        }
    )

    const updateTableDraft = (
        endorsement: Endorsement,
        updates: Partial<Endorsement>
    ) => {
        setTableDrafts((drafts) => ({
            ...drafts,
            [endorsement.id]: {
                ...(drafts[endorsement.id] ?? endorsement),
                ...updates,
            },
        }))
    }

    const startTableEditing = () => {
        setTableDrafts(
            Object.fromEntries(
                tableEndorsements.map((endorsement) => [
                    endorsement.id,
                    { ...endorsement },
                ])
            )
        )
        setIsTableEditing(true)
    }

    const cancelTableEditing = () => {
        setTableDrafts({})
        setIsTableEditing(false)
    }

    const saveTableEditing = () => {
        Object.values(tableDrafts).forEach((endorsement) => {
            const original = filteredEndorsements.find(
                (item) => item.id === endorsement.id
            )
            if (!original) return

            updateMutation.mutate({
                currentValue: original,
                newValue: endorsement,
            })
        })
        cancelTableEditing()
    }

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

    const selectEndorsementView = (nextView: EndorsementView) => {
        setEndorsementView(nextView)
        setSelectedEndorsement(null)
        setFormState(null)
        setSelectedTab('detail')
        setSidebarMobileVisible(true)
        setTableVisibleCount(25)
        setTableDrafts({})
        setIsTableEditing(false)
    }

    const endorsementTableColumns: Column<Endorsement>[] = [
        {
            key: 'avatar',
            header: 'Image',
            width: '5rem',
            allowOverflow: true,
            render: (endorsement) => (
                <EndorsementAvatar
                    endorsement={endorsement}
                    size={32}
                    showBadge={false}
                    className={styles.tableAvatar}
                />
            ),
            cellClassName: () => styles.tableAvatarCell,
            onCellClick: handleSelectItem,
        },
        {
            key: 'name',
            header: 'Name',
            width: 'minmax(16rem, 2fr)',
            allowOverflow: true,
            render: (endorsement) => (
                <span className={styles.tableNameCell}>
                    {endorsement.name}
                    {endorsement.incumbent && '*'}
                </span>
            ),
            renderEdit: (endorsement) => (
                <input
                    className={styles.tableEditInput}
                    value={endorsement.name}
                    onChange={(event) =>
                        updateTableDraft(endorsement, {
                            name: event.target.value,
                        })
                    }
                />
            ),
            sortValue: (endorsement) => endorsement.name,
            onCellClick: handleSelectItem,
        },
        {
            key: 'state',
            header: 'State',
            render: (endorsement) => getStateLabel(endorsement.state),
            renderEdit: (endorsement) => (
                <input
                    className={styles.tableEditInput}
                    value={endorsement.state}
                    onChange={(event) =>
                        updateTableDraft(endorsement, {
                            state: event.target.value,
                        })
                    }
                />
            ),
            sortValue: (endorsement) => endorsement.state,
        },
        {
            key: 'endorsementLevel',
            header: 'Endorsement',
            render: (endorsement) =>
                endorsement.endorsementLevel === EndorsementType.None
                    ? 'No Endorsement'
                    : ENDORSEMENT_TYPE_LABELS[endorsement.endorsementLevel],
            renderEdit: (endorsement) => (
                <select
                    className={styles.tableEditInput}
                    value={endorsement.endorsementLevel}
                    onChange={(event) =>
                        updateTableDraft(endorsement, {
                            endorsementLevel: Number(event.target.value),
                        })
                    }
                >
                    {Object.values(EndorsementType)
                        .filter(
                            (value): value is number =>
                                typeof value === 'number'
                        )
                        .map((value) => (
                            <option key={value} value={value}>
                                {value === EndorsementType.None
                                    ? 'No Endorsement'
                                    : ENDORSEMENT_TYPE_LABELS[value]}
                            </option>
                        ))}
                </select>
            ),
            sortValue: (endorsement) => endorsement.endorsementLevel,
        },
        {
            key: 'initiativeLevel',
            header: 'Initiative',
            render: (endorsement) =>
                endorsement.initiativeLevel === InitiativeType.None
                    ? 'No Initiative'
                    : INITIATIVE_TYPE_LABELS[endorsement.initiativeLevel],
            renderEdit: (endorsement) => (
                <select
                    className={styles.tableEditInput}
                    value={endorsement.initiativeLevel}
                    onChange={(event) =>
                        updateTableDraft(endorsement, {
                            initiativeLevel: Number(event.target.value),
                        })
                    }
                >
                    {Object.values(InitiativeType)
                        .filter(
                            (value): value is number =>
                                typeof value === 'number'
                        )
                        .map((value) => (
                            <option key={value} value={value}>
                                {value === InitiativeType.None
                                    ? 'No Initiative'
                                    : INITIATIVE_TYPE_LABELS[value]}
                            </option>
                        ))}
                </select>
            ),
            sortValue: (endorsement) => endorsement.initiativeLevel,
        },
        {
            key: 'electionDate',
            header: 'Election Date',
            render: (endorsement) => makeDateTag(endorsement) ?? 'None',
            renderEdit: (endorsement) => (
                <input
                    className={styles.tableEditInput}
                    type="date"
                    value={
                        getRelevantElectionDate(endorsement)
                            ?.toISOString()
                            .slice(0, 10) ?? ''
                    }
                    onChange={(event) =>
                        updateTableDraft(endorsement, {
                            generalElectionDate: event.target.value
                                ? new Date(
                                      `${event.target.value}T00:00:00.000Z`
                                  )
                                : null,
                        })
                    }
                />
            ),
            sortValue: (endorsement) =>
                getRelevantElectionDate(endorsement)?.getTime() ?? 0,
        },
        {
            key: 'published',
            header: 'Published',
            render: (endorsement) =>
                endorsement.endorsementPublished ? 'Yes' : 'No',
            renderEdit: (endorsement) => (
                <input
                    className={styles.tableEditCheckbox}
                    type="checkbox"
                    checked={endorsement.endorsementPublished}
                    onChange={(event) =>
                        updateTableDraft(endorsement, {
                            endorsementPublished: event.target.checked,
                        })
                    }
                />
            ),
            sortValue: (endorsement) => endorsement.endorsementPublished,
        },
    ]

    const renderTable = () => {
        if (endorsementsQuery.isPending)
            return <div className={styles.tableState}>Loading...</div>

        if (endorsementsQuery.error)
            return (
                <div className={styles.tableState}>
                    Unable to load endorsements.
                </div>
            )

        if (tableEndorsements.length === 0)
            return (
                <div className={styles.tableState}>No endorsements found</div>
            )

        return (
            <div className={styles.tableWrapper}>
                <Table
                    columns={endorsementTableColumns}
                    data={tableEndorsements.map(
                        (endorsement) =>
                            tableDrafts[endorsement.id] ?? endorsement
                    )}
                    rowKey={(endorsement) => endorsement.id}
                    options={{ zebra: showTableZebra, editing: isTableEditing }}
                    footer={
                        tableHasNextPage && (
                            <div
                                ref={tableSentinelRef}
                                className={styles.tableLoadMore}
                            >
                                Loading more endorsements...
                            </div>
                        )
                    }
                />
            </div>
        )
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

    const tableOptionsMenu = (
        <DropdownButton
            buttonVariant="minimal"
            label="Table Options"
            menu={({ closeDropdown }) => (
                <DropdownOverlay
                    className={styles.tableOptionsBox}
                    label="Table Options"
                    onClose={closeDropdown}
                    bodyClassName={styles.tableOptionsBody}
                    body={
                        <div className={styles.tableOptionRow}>
                            <span className={styles.tableOptionLabel}>
                                Zebra striping
                            </span>
                            <ToggleGroup<boolean>
                                ariaLabel="Zebra striping"
                                value={showTableZebra}
                                options={[
                                    { value: true, label: 'Show' },
                                    { value: false, label: 'Hide' },
                                ]}
                                onChange={setShowTableZebra}
                            />
                        </div>
                    }
                />
            )}
        />
    )

    const resetTableView = () => {
        setTableVisibleCount(25)
        setTableDrafts({})
        setIsTableEditing(false)
    }

    const tableSearch = (
        <SearchBar
            placeholder="Search..."
            aria-label="Search endorsements"
            value={search.query ?? ''}
            onChange={(event) => {
                resetTableView()
                onSearch({
                    ...search,
                    query: event.target.value,
                    page: 0,
                })
            }}
            onClear={() => {
                resetTableView()
                onSearch({ ...search, query: '', page: 0 })
            }}
            settingsDropdownButton={<IoMdOptions aria-hidden="true" />}
        />
    )

    const sidebarSettingsContent = (
        <div className={styles.settingsOverlay}>
            <SidebarListFilters
                search={search}
                onSearch={onSearch}
                sortFieldOptions={endorsementSortFields}
                showSort
                showLimit
            />
        </div>
    )

    const headerViewButton = (
        <DropdownButton
            type="button"
            buttonVariant="icon"
            aria-label="Change view"
            title="Change view"
            icon={<FiGrid size={20} />}
            menu={({ closeDropdown }) => (
                <DropdownOverlay
                    onClose={closeDropdown}
                    body={
                        <>
                            <DropdownOverlayButton
                                icon={<FaList />}
                                checked={endorsementView === 'list'}
                                onClick={() => {
                                    selectEndorsementView('list')
                                    closeDropdown()
                                }}
                            >
                                List
                            </DropdownOverlayButton>
                            <DropdownOverlayButton
                                icon={<FaColumns />}
                                checked={endorsementView === 'table'}
                                onClick={() => {
                                    selectEndorsementView('table')
                                    closeDropdown()
                                }}
                            >
                                Table
                            </DropdownOverlayButton>
                        </>
                    }
                />
            )}
        />
    )

    return (
        <Panel
            includeSidebar={endorsementView === 'list'}
            includeHeader={endorsementView === 'table'}
            headerRight={
                endorsementView === 'table' && (
                    <div className={styles.panelHeaderRight}>
                        <div className={styles.panelTimestamp}>
                            Showing {tableEndorsements.length.toLocaleString()}{' '}
                            of {endorsementCount.toLocaleString()}
                        </div>
                        {headerViewButton}
                        {tableSearch}
                    </div>
                )
            }
            headerLead={
                endorsementView === 'table' && selectedEndorsement ? (
                    <PanelBackButton
                        label="Endorsements"
                        onClick={() => selectEndorsementView('table')}
                        showOnDesktop
                    />
                ) : undefined
            }
            collapsedSidebarMode="compact"
            sidebarTogglePlacement="header"
            showSidebarFooterWhenCollapsed={false}
            showSidebarBorderWhenCollapsed
            largeTitle
            prominentHeaderRight={<></>}
            sidebarWidth="25.5rem"
            collapsedSidebarWidth="5rem"
            sidebarClassName={styles.sidebarBg}
            sidebarMobileVisible={isDesktop || sidebarMobileVisible}
            label="Endorsements"
            showScrollbar={false}
            prominentHeaderRightExtra={headerViewButton}
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
            }}
            sidebarFilterContent={sidebarSettingsContent}
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
            {endorsementView === 'table' && !selectedEndorsement && (
                <div className={styles.tablePane}>
                    <div className={styles.tableHeader}>
                        <div className={styles.tableHeading}>
                            <h1 className={styles.tableTitle}>Endorsements</h1>
                            <p className={styles.tableSubTitle}>
                                Browse and manage endorsement records.
                            </p>
                        </div>
                        <div className={styles.tableToolbar}>
                            {isTableEditing ? (
                                <>
                                    <button
                                        type="button"
                                        className={styles.toolbarButton}
                                        onClick={saveTableEditing}
                                        disabled={updateMutation.isPending}
                                    >
                                        <FaSave aria-hidden="true" /> Save
                                    </button>
                                    <button
                                        type="button"
                                        className={cn(
                                            styles.toolbarButton,
                                            styles.cancelToolbarButton
                                        )}
                                        onClick={cancelTableEditing}
                                        disabled={updateMutation.isPending}
                                    >
                                        <FaTimes aria-hidden="true" /> Cancel
                                    </button>
                                </>
                            ) : (
                                <button
                                    type="button"
                                    className={styles.toolbarButton}
                                    disabled={tableEndorsements.length === 0}
                                    onClick={startTableEditing}
                                >
                                    <FaEdit aria-hidden="true" /> Edit
                                </button>
                            )}
                            {tableOptionsMenu}
                        </div>
                    </div>
                    {renderTable()}
                </div>
            )}
            {(endorsementView === 'list' || selectedEndorsement) && (
                <div className={styles.detailsPane}>
                    {endorsementView === 'list' && (
                        <MobileSidebarBackButton
                            label="Endorsements"
                            sidebarMobileVisible={
                                isDesktop || sidebarMobileVisible
                            }
                            onBack={() => setSidebarMobileVisible(true)}
                            className={styles.backButton}
                        />
                    )}

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
                                createMutation.isPending ||
                                updateMutation.isPending
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
            )}
        </Panel>
    )
}
