'use client'

import styles from './page.module.css'
import { List, ListElement } from '@/app/admin/layout/List'
import {
    CheckboxField,
    Form,
    FormGroup,
    FormState,
    TextField,
} from '@/components/common/forms'
import { Endorsement, zEndorsement } from '@/contracts/data/Endorsement'
import { SearchRequest, SortDirection } from '@/contracts/requests'
import { CreateEndorsementRequest } from '@/contracts/requests/CreateEndorsementRequest'
import { UpdateEndorsementRequest } from '@/contracts/requests/UpdateEndorsementRequest'
import { FetchError } from '@/models'
import { hasPermission, useCurrentUser, useFetch } from '@/util/hooks'
import {
    keepPreviousData,
    skipToken,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import z from 'zod'

function makeDefaultEndorsement(): Endorsement {
    return {
        id: -1,
        name: '',
        description: '',
        candidateLink: '',
        linkLabel: '',
        imgUrl: '',
        isStateInitiative: false,
        isNationalInitiative: false,
        isPvMember: false,
        tookPvPledge: false,
    }
}

function toRequest(
    endorsement: Endorsement
): CreateEndorsementRequest & UpdateEndorsementRequest {
    return {
        name: endorsement.name,
        description: endorsement.description,
        candidateLink: endorsement.candidateLink,
        linkLabel: endorsement.linkLabel,
        imgUrl: endorsement.imgUrl,
        isStateInitiative: endorsement.isStateInitiative,
        isNationalInitiative: endorsement.isNationalInitiative,
        isPvMember: endorsement.isPvMember,
        tookPvPledge: endorsement.tookPvPledge,
    }
}

export default function Page() {
    const queryClient = useQueryClient()
    const { ready, onGet, onPost, onPatch, onDelete } = useFetch()
    const loggedInUser = useCurrentUser()

    const [search, setSearch] = useState<SearchRequest>({
        page: 0,
        limit: 25,
        sort: SortDirection.DESC,
    })

    const [selectedId, setSelectedId] = useState<number | null>(null)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [newEndorsement, setNewEndorsement] = useState<Endorsement>(
        makeDefaultEndorsement
    )
    const [formState, setFormState] = useState<FormState<Endorsement> | null>(
        null
    )

    const canManageEndorsements = useMemo(() => {
        return loggedInUser.data
            ? hasPermission(loggedInUser.data, 'Manage Endorsements')
            : false
    }, [loggedInUser.data])

    const endorsementsQuery = useQuery({
        queryKey: ['/endorsements'],
        queryFn: ready
            ? () => onGet<Endorsement[]>('/endorsements', z.array(zEndorsement))
            : skipToken,
        placeholderData: keepPreviousData,
    })

    const filteredEndorsements = useMemo(() => {
        const raw = endorsementsQuery.data ?? []
        const query = search.query?.trim().toLowerCase()

        const filtered = query
            ? raw.filter((endorsement) => {
                  return (
                      endorsement.name.toLowerCase().includes(query) ||
                      endorsement.description.toLowerCase().includes(query) ||
                      endorsement.linkLabel.toLowerCase().includes(query)
                  )
              })
            : raw

        const sorted = [...filtered].sort((a, b) => {
            const result = a.name.localeCompare(b.name)
            return search.sort === SortDirection.ASC ? result : -result
        })

        const page = search.page ?? 0
        const limit = search.limit ?? 25
        const offset = page * limit

        return {
            count: sorted.length,
            data: sorted.slice(offset, offset + limit),
        }
    }, [endorsementsQuery.data, search])

    const onSearch = (nextSearch: SearchRequest) => {
        setSearch(nextSearch)
    }

    const hasNoEndorsements =
        !endorsementsQuery.isPending &&
        !endorsementsQuery.error &&
        (endorsementsQuery.data?.length ?? 0) == 0

    const endorsementQuery = useQuery({
        queryKey: [`/endorsements/${selectedId}`],
        queryFn:
            ready && selectedId != null
                ? () =>
                      onGet<Endorsement>(
                          `/endorsements/${selectedId}`,
                          zEndorsement
                      )
                : skipToken,
        placeholderData: keepPreviousData,
    })

    const createMutation = useMutation<
        void,
        FetchError,
        CreateEndorsementRequest
    >({
        mutationFn: (request) => onPost<void>('/endorsements', request, null),
        onSuccess: () => {
            setIsCreateModalOpen(false)
            setNewEndorsement(makeDefaultEndorsement())
        },
        onError: (error) => {
            if (error.status == 403) {
                alert(
                    'Not authorized. You need the Manage Endorsements permission to create endorsements.'
                )
                return
            }

            alert(error.message || 'Failed to create endorsement.')
        },
        onSettled: () =>
            Promise.all([
                queryClient.invalidateQueries({ queryKey: ['/endorsements'] }),
                selectedId != null
                    ? queryClient.invalidateQueries({
                          queryKey: [`/endorsements/${selectedId}`],
                      })
                    : Promise.resolve(),
            ]),
    })

    const updateMutation = useMutation<
        Endorsement,
        FetchError,
        {
            id: number
            endorsement: Endorsement
            request: UpdateEndorsementRequest
        },
        Endorsement | undefined
    >({
        mutationFn: ({ id, request }) =>
            onPatch<Endorsement>(`/endorsements/${id}`, request, zEndorsement),
        onMutate: ({ id, endorsement }) => {
            const prev: Endorsement | undefined = queryClient.getQueryData([
                `/endorsements/${id}`,
            ])

            queryClient.setQueryData([`/endorsements/${id}`], endorsement)
            queryClient.setQueryData(
                ['/endorsements'],
                (res: Endorsement[] | undefined) =>
                    (res ?? []).map((prevItem) =>
                        prevItem.id == endorsement.id ? endorsement : prevItem
                    )
            )

            return prev
        },
        onError: (error, { id }, prev) => {
            console.error(error)

            queryClient.setQueryData([`/endorsements/${id}`], prev)
            queryClient.setQueryData(
                ['/endorsements'],
                (res: Endorsement[] | undefined) =>
                    (res ?? []).map((endorsement) =>
                        endorsement.id == prev?.id ? prev : endorsement
                    )
            )
        },
        onSuccess: (data, { id }) => {
            queryClient.setQueryData([`/endorsements/${id}`], data)
            queryClient.setQueryData(
                ['/endorsements'],
                (res: Endorsement[] | undefined) =>
                    (res ?? []).map((endorsement) =>
                        endorsement.id == data.id ? data : endorsement
                    )
            )
        },
        onSettled: (_data, _error, { id }) =>
            Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ['/endorsements'],
                }),
                queryClient.invalidateQueries({
                    queryKey: [`/endorsements/${id}`],
                }),
            ]),
    })

    const deleteMutation = useMutation<void, FetchError, number>({
        mutationFn: (id) => onDelete(`/endorsements/${id}`),
        onSuccess: (_data, id) => {
            queryClient.removeQueries({ queryKey: [`/endorsements/${id}`] })
            queryClient.setQueryData(
                ['/endorsements'],
                (res: Endorsement[] | undefined) =>
                    (res ?? []).filter((endorsement) => endorsement.id != id)
            )

            setSelectedId(null)
            setIsCreateModalOpen(false)
            setNewEndorsement(makeDefaultEndorsement())
        },
        onSettled: () =>
            queryClient.invalidateQueries({
                queryKey: ['/endorsements'],
            }),
    })

    const maybeConfirmDiscard = () => {
        if (!formState?.dirty) return true

        return confirm(
            'You have unsaved changes! Navigating away from this item will discard them.'
        )
    }

    const handleSelectItem = (value: Endorsement) => {
        if (value.id === selectedId) return
        if (!maybeConfirmDiscard()) return

        setIsCreateModalOpen(false)
        setSelectedId(value.id)
    }

    const handleCreateNew = () => {
        if (!canManageEndorsements) {
            alert(
                'Not authorized. You need the Manage Endorsements permission to create endorsements.'
            )
            return
        }

        setIsCreateModalOpen(true)
        setNewEndorsement(makeDefaultEndorsement())
    }

    const handleCloseCreateModal = () => {
        if (createDirty) {
            const proceed = confirm(
                'You have unsaved changes! Closing this popup will discard them.'
            )
            if (!proceed) return
        }

        setIsCreateModalOpen(false)
        setNewEndorsement(makeDefaultEndorsement())
    }

    const handleDelete = () => {
        if (selectedId == null) return
        if (!canManageEndorsements) {
            alert(
                'Not authorized. You need the Manage Endorsements permission to delete endorsements.'
            )
            return
        }

        const proceed = confirm(
            'Delete this endorsement? This action cannot be undone.'
        )
        if (!proceed) return

        deleteMutation.mutate(selectedId)
    }

    const handleFormUpdate = (state: FormState<Endorsement>) => {
        setFormState(state)
    }

    const handleSave = (endorsement: Endorsement) => {
        if (!canManageEndorsements) {
            alert(
                'Not authorized. You need the Manage Endorsements permission to edit endorsements.'
            )
            return
        }

        const request = toRequest(endorsement)
        updateMutation.mutate({
            id: endorsement.id,
            endorsement,
            request,
        })
    }

    const handleCreate = () => {
        const request = toRequest(newEndorsement)
        createMutation.mutate(request)
    }

    const createInvalid =
        !newEndorsement.name.trim() || !newEndorsement.description.trim()
    const createDirty =
        newEndorsement.name.trim() !== '' ||
        newEndorsement.description.trim() !== '' ||
        newEndorsement.candidateLink.trim() !== '' ||
        newEndorsement.linkLabel.trim() !== '' ||
        newEndorsement.imgUrl.trim() !== '' ||
        newEndorsement.isStateInitiative ||
        newEndorsement.isNationalInitiative ||
        newEndorsement.isPvMember ||
        newEndorsement.tookPvPledge

    const form = endorsementQuery.data
    const saving =
        createMutation.isPending ||
        updateMutation.isPending ||
        deleteMutation.isPending

    return (
        <>
            <List
                search={search}
                count={
                    hasNoEndorsements ? undefined : filteredEndorsements.count
                }
                isPending={endorsementsQuery.isPending}
                error={endorsementsQuery.error}
                emptyMessage="No endorsements yet"
                onSearch={onSearch}
            >
                {filteredEndorsements.data.map((item) => (
                    <ListElement
                        key={item.id}
                        selected={selectedId == item.id}
                        onClick={() => handleSelectItem(item)}
                    >
                        <div className={styles.listItemRow}>
                            <span className={styles.listItemName}>
                                {item.name}
                            </span>
                        </div>
                    </ListElement>
                ))}
            </List>

            <div className={styles.rightPane}>
                <div className={styles.paneHeader}>
                    <div className={styles.paneHeaderRow}>
                        <h2 className={styles.paneHeaderTitle}>Endorsements</h2>

                        <div className={styles.actionBar}>
                            <button
                                className={styles.createButton}
                                onClick={handleCreateNew}
                            >
                                New Endorsement
                            </button>
                            {formState?.editing && selectedId != null && (
                                <button
                                    className={styles.deleteButton}
                                    disabled={deleteMutation.isPending}
                                    onClick={handleDelete}
                                >
                                    Delete Endorsement
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {!canManageEndorsements && (
                    <div className={styles.permissionWarning}>
                        You are currently read-only for endorsements. Ask an
                        admin to grant the Manage Endorsements permission.
                    </div>
                )}

                {!form && (
                    <div className={styles.emptyState}>
                        No endorsement selected
                    </div>
                )}

                {form && (
                    <Form<Endorsement>
                        key={form.id}
                        form={form}
                        title={form.name || `Endorsement ${form.id}`}
                        saving={saving}
                        readonly={!canManageEndorsements}
                        onUpdate={handleFormUpdate}
                        onSave={handleSave}
                    >
                        <FormGroup title="Details">
                            <TextField label="Name" field="name" required />
                            <TextField
                                label="Description"
                                field="description"
                                required
                            />
                            <TextField
                                label="Candidate Link"
                                field="candidateLink"
                            />
                            <TextField label="Link Label" field="linkLabel" />
                            <TextField label="Image URL" field="imgUrl" />
                            <CheckboxField
                                label="State Initiative"
                                field="isStateInitiative"
                            />
                            <CheckboxField
                                label="National Initiative"
                                field="isNationalInitiative"
                            />
                            <CheckboxField
                                label="PV Member"
                                field="isPvMember"
                            />
                            <CheckboxField
                                label="Took PV Pledge"
                                field="tookPvPledge"
                            />
                        </FormGroup>
                    </Form>
                )}
            </div>

            {isCreateModalOpen && (
                <div
                    className={styles.modalBackdrop}
                    onClick={handleCloseCreateModal}
                >
                    <div
                        className={styles.modal}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>
                                Create New Endorsement
                            </h2>
                            <button
                                className={styles.modalCloseButton}
                                onClick={handleCloseCreateModal}
                            >
                                Cancel
                            </button>
                        </div>

                        <div className={styles.modalBody}>
                            <label className={styles.popupField}>
                                <span>Name *</span>
                                <input
                                    value={newEndorsement.name}
                                    onChange={(event) =>
                                        setNewEndorsement((prev) => ({
                                            ...prev,
                                            name: event.target.value,
                                        }))
                                    }
                                />
                            </label>

                            <label className={styles.popupField}>
                                <span>Description *</span>
                                <input
                                    value={newEndorsement.description}
                                    onChange={(event) =>
                                        setNewEndorsement((prev) => ({
                                            ...prev,
                                            description: event.target.value,
                                        }))
                                    }
                                />
                            </label>

                            <label className={styles.popupField}>
                                <span>Candidate Link</span>
                                <input
                                    value={newEndorsement.candidateLink}
                                    onChange={(event) =>
                                        setNewEndorsement((prev) => ({
                                            ...prev,
                                            candidateLink: event.target.value,
                                        }))
                                    }
                                />
                            </label>

                            <label className={styles.popupField}>
                                <span>Link Label</span>
                                <input
                                    value={newEndorsement.linkLabel}
                                    onChange={(event) =>
                                        setNewEndorsement((prev) => ({
                                            ...prev,
                                            linkLabel: event.target.value,
                                        }))
                                    }
                                />
                            </label>

                            <label className={styles.popupField}>
                                <span>Image URL</span>
                                <input
                                    value={newEndorsement.imgUrl}
                                    onChange={(event) =>
                                        setNewEndorsement((prev) => ({
                                            ...prev,
                                            imgUrl: event.target.value,
                                        }))
                                    }
                                />
                            </label>

                            <label className={styles.popupCheckRow}>
                                <input
                                    type="checkbox"
                                    checked={newEndorsement.isStateInitiative}
                                    onChange={(event) =>
                                        setNewEndorsement((prev) => ({
                                            ...prev,
                                            isStateInitiative:
                                                event.target.checked,
                                        }))
                                    }
                                />
                                <span>State Initiative</span>
                            </label>

                            <label className={styles.popupCheckRow}>
                                <input
                                    type="checkbox"
                                    checked={
                                        newEndorsement.isNationalInitiative
                                    }
                                    onChange={(event) =>
                                        setNewEndorsement((prev) => ({
                                            ...prev,
                                            isNationalInitiative:
                                                event.target.checked,
                                        }))
                                    }
                                />
                                <span>National Initiative</span>
                            </label>

                            <label className={styles.popupCheckRow}>
                                <input
                                    type="checkbox"
                                    checked={newEndorsement.isPvMember}
                                    onChange={(event) =>
                                        setNewEndorsement((prev) => ({
                                            ...prev,
                                            isPvMember: event.target.checked,
                                        }))
                                    }
                                />
                                <span>PV Member</span>
                            </label>

                            <label className={styles.popupCheckRow}>
                                <input
                                    type="checkbox"
                                    checked={newEndorsement.tookPvPledge}
                                    onChange={(event) =>
                                        setNewEndorsement((prev) => ({
                                            ...prev,
                                            tookPvPledge: event.target.checked,
                                        }))
                                    }
                                />
                                <span>Took PV Pledge</span>
                            </label>
                        </div>

                        <div className={styles.modalFooter}>
                            <button
                                className={styles.modalSecondaryButton}
                                onClick={handleCloseCreateModal}
                            >
                                Cancel
                            </button>
                            <button
                                className={styles.modalPrimaryButton}
                                disabled={
                                    !createDirty ||
                                    createInvalid ||
                                    createMutation.isPending
                                }
                                onClick={handleCreate}
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
