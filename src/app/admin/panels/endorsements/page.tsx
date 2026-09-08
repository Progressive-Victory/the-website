'use client'

import { EndorsementAvatar } from './components/EndorsementAvatar'
import { EndorsementBanner } from './components/EndorsementBanner'
import styles from './page.module.css'
import { FilterTag, FilterTags } from '@/app/admin/layout/FilterTags'
import { ListElement, List } from '@/app/admin/layout/List'
import {
    CheckboxField,
    DateField,
    DropDownField,
    Form,
    FormField,
    FormFieldProps,
    FormGroup,
    FormState,
    TextField,
    useConfigure,
} from '@/components/common/forms'
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
import { ChangeEvent, useCallback, useState } from 'react'
import { FaClipboard, FaThumbsUp, FaUsers, FaVoteYea } from 'react-icons/fa'
import { FaClipboardUser } from 'react-icons/fa6'
import { MdVerified } from 'react-icons/md'

const blankEndorsement: Endorsement = {
    id: -1,
    name: '',
    state: '',
    jurisiction: null,
    endorsementDate: null,
    endorsementReason: '',
    endorsementPublished: false,
    publishEndorsement: false,
    incumbent: false,
    handleHref: null,
    handle: '',
    quote: '',
    websiteHref: '',
    donateHref: null,
    isPvMember: false,
    imgUrl: '',
    primaryElectionUtc: null,
    generalElectionUtc: null,
    initiativeLevel: InitiativeType.State,
    endorsementLevel: EndorsementType.None,
    avatarBgColor: BackgroundColor.Blue,
    electionStatus: ElectionStatus.NoElection,
}

const stateOptionsWithEmpty = [
    { value: '', label: 'No state selected' },
    ...stateOptions,
]

const stateNames = new Map(
    stateOptions.map((option) => [option.value, option.label])
)

const alwaysShowPrimaryDate = new Set([
    ElectionStatus.LostPrimary,
    ElectionStatus.DroppedOut,
    ElectionStatus.NoElection,
])

function getListElectionDate(endorsement: Endorsement) {
    const { primaryElectionUtc, generalElectionUtc, electionStatus } =
        endorsement
    if (alwaysShowPrimaryDate.has(electionStatus)) return primaryElectionUtc
    if (primaryElectionUtc && primaryElectionUtc >= new Date())
        return primaryElectionUtc
    return generalElectionUtc ?? primaryElectionUtc
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

const avatarBgColorOptions = [
    { value: BackgroundColor.Blue, label: 'Blue' },
    { value: BackgroundColor.Yellow, label: 'Yellow' },
]

const electionStatusOptions = [
    { value: ElectionStatus.Elected, label: 'Elected' },
    { value: ElectionStatus.WonPrimary, label: 'Won Primary' },
    { value: ElectionStatus.UpcomingPrimary, label: 'Upcoming Primary' },
    { value: ElectionStatus.LostGeneral, label: 'Lost General' },
    { value: ElectionStatus.LostPrimary, label: 'Lost Primary' },
    { value: ElectionStatus.DroppedOut, label: 'Dropped Out' },
    { value: ElectionStatus.NoElection, label: 'No Election' },
]

const endorsementSortFields = [
    { value: 'name', label: 'Name' },
    { value: 'primaryElectionUtc', label: 'Primary Date' },
    { value: 'generalElectionUtc', label: 'General Date' },
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

export default function Page() {
    const queryClient = useQueryClient()
    const endorsementQueries = useEndorsementQueries()

    const [selectedEndorsement, setSelectedEndorsement] =
        useState<Endorsement | null>(null)
    const [formState, setFormState] = useState<FormState<Endorsement> | null>(
        null
    )

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
                field === 'primaryElectionUtc' ||
                field === 'generalElectionUtc'
            ) {
                const aDate =
                    (field === 'primaryElectionUtc'
                        ? a.primaryElectionUtc
                        : a.generalElectionUtc
                    )?.getTime() ?? 0
                const bDate =
                    (field === 'primaryElectionUtc'
                        ? b.primaryElectionUtc
                        : b.generalElectionUtc
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

        if (formState?.dirty) {
            const proceed = confirm(
                'You have unsaved changes! Selecting a new list element will discard them.'
            )
            if (!proceed) return
        }

        setSelectedEndorsement(value)
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
    }

    const handleDelete = () => {
        if (!selectedEndorsement) return

        deleteMutation.mutate({
            currentValue: selectedEndorsement,
            newValue: undefined,
        })
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
                <Form<Endorsement>
                    key={selectedEndorsement?.id}
                    className={styles.detailsContent}
                    form={selectedEndorsement}
                    title={
                        formState?.mode == 'create'
                            ? 'New Endorsement'
                            : (selectedEndorsement?.name ?? 'Endorsement')
                    }
                    saving={
                        createMutation.isPending || updateMutation.isPending
                    }
                    onUpdate={setFormState}
                    onSave={handleSave}
                    onCreate={handleCreate}
                    onDelete={handleDelete}
                    beforeHeader={
                        selectedEndorsement ? (
                            <EndorsementBanner
                                endorsement={
                                    formState?.form ?? selectedEndorsement
                                }
                                uploadImage={endorsementQueries.uploadImage}
                                containerClassName={styles.detailsHeader}
                                coverClassName={styles.bannerCover}
                            />
                        ) : undefined
                    }
                >
                    <FormGroup title="Details">
                        <TextField label="Name" field="name" required />
                        <DropDownField<Endorsement>
                            label="State"
                            field="state"
                            required
                            options={stateOptionsWithEmpty}
                        />
                        <TextField
                            label="Description"
                            field="endorsementReason"
                            required
                        />
                        <TextField label="Jurisdiction" field="jurisiction" />
                        <TextField label="Website" field="websiteHref" />
                        <TextField label="Handle" field="handle" />
                        <TextField label="Handle URL" field="handleHref" />
                        <TextField label="Quote" field="quote" />
                        <TextField label="Donate URL" field="donateHref" />
                        <ImageField
                            label="Image"
                            field="imgUrl"
                            uploadImage={endorsementQueries.uploadImage}
                        />
                    </FormGroup>

                    <FormGroup title="Elections">
                        <DateField
                            label="General Election"
                            field="generalElectionUtc"
                            format={{ dateStyle: 'medium' }}
                        />
                        <DateField
                            label="Primary Election"
                            field="primaryElectionUtc"
                            format={{ dateStyle: 'medium' }}
                        />
                    </FormGroup>

                    <FormGroup title="Classification">
                        <DropDownField<Endorsement>
                            label="Initiative Level"
                            getter={(form) => form.initiativeLevel}
                            setter={(form, field) => {
                                const initiativeLevel = Number(
                                    field
                                ) as InitiativeType
                                return {
                                    ...form,
                                    initiativeLevel,
                                }
                            }}
                            options={initiativeLevelOptions}
                        />
                        <DropDownField<Endorsement>
                            label="Endorsement Level"
                            getter={(form) => form.endorsementLevel}
                            setter={(form, field) => {
                                const endorsementLevel = Number(
                                    field
                                ) as EndorsementType
                                return {
                                    ...form,
                                    endorsementLevel,
                                }
                            }}
                            options={endorsementLevelOptions}
                        />
                        <DropDownField<Endorsement>
                            label="Avatar Background"
                            getter={(form) => form.avatarBgColor}
                            setter={(form, field) => ({
                                ...form,
                                avatarBgColor: Number(field) as BackgroundColor,
                            })}
                            options={avatarBgColorOptions}
                        />
                        <DropDownField<Endorsement>
                            label="Election Status"
                            getter={(form) => form.electionStatus}
                            setter={(form, field) => ({
                                ...form,
                                electionStatus: Number(field) as ElectionStatus,
                            })}
                            options={electionStatusOptions}
                        />
                        <CheckboxField label="PV Member" field="isPvMember" />
                        <CheckboxField
                            label="Publish Endorsement"
                            field="endorsementPublished"
                        />
                        <CheckboxField label="Incumbent" field="incumbent" />
                    </FormGroup>
                </Form>
            </div>
        </>
    )
}

interface ImageFieldProps extends FormFieldProps<Endorsement, string> {
    uploadImage: (image: File) => Promise<{ url: string }>
}

function ImageField(props: ImageFieldProps) {
    const { onChange, readonly } = useConfigure(
        props,
        useCallback(
            (field: string) => !props.required || !!field?.trim(),
            [props.required]
        )
    )
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        event.target.value = ''
        if (!file) return

        setUploading(true)
        setError(null)

        try {
            const { url } = await props.uploadImage(file)
            onChange(url)
        } catch (uploadError) {
            setError(
                uploadError instanceof Error
                    ? uploadError.message
                    : 'Failed to upload image'
            )
        } finally {
            setUploading(false)
        }
    }

    return (
        <FormField {...props}>
            <div className={styles.imageField}>
                {!readonly && (
                    <label className={styles.uploadButton}>
                        {uploading ? 'Uploading…' : 'Upload Image'}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(event) => {
                                void handleFileChange(event)
                            }}
                            disabled={uploading}
                            hidden
                        />
                    </label>
                )}
                {error && <span className={styles.uploadError}>{error}</span>}
            </div>
        </FormField>
    )
}
