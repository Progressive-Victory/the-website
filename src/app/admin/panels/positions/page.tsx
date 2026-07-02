'use client'

import styles from './page.module.css'
import { ListElement, List } from '@/app/admin/layout/List'
import {
    Form,
    FormGroup,
    FormState,
    SelectManyField,
    TextField,
} from '@/components/common/forms'
import { Position } from '@/contracts/data'
import { SortDirection } from '@/contracts/requests'
import { PositionHierarchyResponse } from '@/contracts/responses'
import { usePositionQueries } from '@/queries'
import {
    useOptimisticDelete,
    useOptimisticUpdate,
    useUnpaginatedSearch,
} from '@/util/hooks'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'

const blankPosition: Position = {
    id: -1,
    name: '',
    childIds: [],
    userIds: [],
}

export default function Page() {
    const queryClient = useQueryClient()
    const positionQueries = usePositionQueries()

    const [selectedPosition, setSelectedPosition] = useState<Position | null>(
        null
    )
    const [formState, setFormState] = useState<FormState<Position> | null>(null)

    const positionHierarchy = useQuery({
        queryKey: ['positionHierarchy'],
        queryFn: positionQueries.getPositionHierarchy,
        enabled: positionQueries.ready,
    })

    const {
        items: positions,
        count: positionCount,
        search,
        onSearch,
    } = useUnpaginatedSearch({
        items: positionHierarchy.data?.positions ?? [],
        initialSearch: { sort: SortDirection.ASC },
        onFilter: (position, query) =>
            position.name
                .toLocaleLowerCase()
                .includes(query.toLocaleLowerCase()),
        onSort: (a, b) => a.name.localeCompare(b.name),
    })

    const positionOptions = useMemo(() => {
        const options = (positionHierarchy.data?.positions ?? []).map((p) => ({
            label: p.name,
            value: p.id,
        }))

        options.sort((a, b) => a.label.localeCompare(b.label))

        return options
    }, [positionHierarchy.data])

    const handleSelectItem = (value: Position) => {
        if (value.id === selectedPosition?.id) return

        if (formState?.dirty) {
            const proceed = confirm(
                'You have unsaved changes! Selecting a new list element will discard them.'
            )
            if (!proceed) return
        }

        setSelectedPosition(value)
    }

    const updatePositionInHierarchyCache = (
        id: number,
        value: Position | null,
        index?: number
    ) => {
        queryClient.setQueryData(
            ['positionHierarchy'],
            (res: PositionHierarchyResponse) => {
                const positions = [...res.positions]
                const currIndex = positions.findIndex((p) => p.id == id)
                const newIndex =
                    index ?? (currIndex < 0 ? positions.length : currIndex)

                if (currIndex >= 0) positions.splice(currIndex, 1)
                if (value) positions.splice(newIndex, 0, value)
                return { ...res, positions }
            }
        )
    }

    const createMutation = useOptimisticUpdate<Position>({
        mutationFn: ({ newValue }) =>
            positionQueries.createPosition({
                name: newValue.name,
                parentIds: [],
            }),
        onChange: (value) => {
            setSelectedPosition(value)
            updatePositionInHierarchyCache(blankPosition.id, value)
        },
    })

    const updateMutation = useOptimisticUpdate<Position>({
        mutationFn: ({ newValue }) =>
            positionQueries.updatePosition(newValue.id, {
                name: newValue.name,
                childIds: newValue.childIds,
            }),
        onChange: (value) => {
            setSelectedPosition(value)
            updatePositionInHierarchyCache(value.id, value)
        },
    })

    const deleteMutation = useOptimisticDelete<Position, { index: number }>({
        mutationFn: ({ currentValue }) =>
            positionQueries.deletePosition(currentValue.id),
        onChange: (value, { currentValue, params: { index } }) => {
            setSelectedPosition(value ?? null)
            updatePositionInHierarchyCache(
                currentValue.id,
                value ?? null,
                index
            )
        },
    })

    const handleCreate = () => blankPosition

    const handleSave = (newPosition: Position) => {
        if (formState?.mode === 'create') {
            createMutation.mutate({
                currentValue: blankPosition,
                newValue: newPosition,
            })
        } else if (selectedPosition != null) {
            updateMutation.mutate({
                currentValue: selectedPosition,
                newValue: newPosition,
            })
        }
    }

    const handleDelete = () => {
        if (!selectedPosition) return

        const index =
            positionHierarchy.data?.positions?.findIndex(
                (p) => p.id == selectedPosition.id
            ) ?? -1
        if (index < 0) return

        deleteMutation.mutate({
            currentValue: selectedPosition,
            newValue: undefined,
            params: { index },
        })
    }

    return (
        <>
            <List
                search={search}
                count={positionCount}
                isPending={positionHierarchy.isPending}
                error={positionHierarchy.error}
                onSearch={onSearch}
            >
                {positions.map((item) => (
                    <ListElement
                        key={item.id}
                        selected={selectedPosition?.id == item.id}
                        onClick={() => handleSelectItem(item)}
                    >
                        <span className={styles.listItemText}>{item.name}</span>
                    </ListElement>
                ))}
            </List>

            <div className={styles.detailPane}>
                <Form<Position>
                    key={selectedPosition?.id}
                    form={selectedPosition}
                    title={
                        formState?.mode == 'create'
                            ? 'New Position'
                            : (selectedPosition?.name ?? 'Position')
                    }
                    saving={updateMutation.isPending}
                    onUpdate={setFormState}
                    onSave={handleSave}
                    onCreate={handleCreate}
                    onDelete={handleDelete}
                >
                    <FormGroup title="Details">
                        <TextField label="Name" field="name" required />
                        {formState?.mode !== 'create' && (
                            <SelectManyField
                                label="Sub-Positions"
                                field="childIds"
                                options={positionOptions}
                            />
                        )}
                    </FormGroup>
                </Form>
            </div>
        </>
    )
}
