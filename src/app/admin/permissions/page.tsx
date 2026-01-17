'use client'

import styles from './page.module.css'
import PaginatedList from '@/components/admin/PaginatedList'
import { Form, FormGroup, FormState, TextField } from '@/components/form'
import { Permission, zPermission } from '@/contracts/data'
import { UpdatePermissionRequest } from '@/contracts/requests'
import { useFetch } from '@/util/hooks'
import { useMutation } from '@tanstack/react-query'
import { useRef, useState } from 'react'

export default function Page() {
    const eventTarget = useRef(new EventTarget())
    const { onPatch } = useFetch()

    const [permissions, setPermissions] = useState<Permission[]>([])
    const [selectedPermission, setSelectedPermission] =
        useState<Permission | null>(null)

    const [formState, setFormState] = useState<FormState<Permission> | null>(
        null
    )

    const updateMutation = useMutation({
        async mutationFn({
            id,
            request,
        }: {
            id: number
            request: UpdatePermissionRequest
        }) {
            await onPatch(`/permissions/${id}`, request, null)
            eventTarget.current.dispatchEvent(new Event('refetch'))
        },
    })

    const handleSelectItem = (value: Permission) => {
        if (value.id === selectedPermission?.id) return

        if (formState?.dirty) {
            const proceed = confirm(
                'You have unsaved changes! Selecting a new list element will discard them.'
            )
            if (!proceed) return
        }

        setSelectedPermission(value)
    }

    const handleSave = (permission: Permission) => {
        setSelectedPermission(permission)
        updateMutation.mutate({
            id: permission.id,
            request: { name: permission.name },
        })
    }

    const makeItem = (permission: Permission) => ({
        id: permission.id.toString(),
        value: permission,
    })

    return (
        <>
            <PaginatedList<Permission>
                zodSchema={zPermission}
                eventTarget={eventTarget.current}
                endpoint="/permissions"
                filters={[]}
                searchFields={[
                    {
                        id: 'name',
                        name: 'Name',
                    },
                ]}
                items={permissions.map(makeItem)}
                selectedItem={
                    selectedPermission ? makeItem(selectedPermission) : null
                }
                onSelectItem={({ value }) => handleSelectItem(value)}
                setItems={setPermissions}
                renderItem={({ value }) => (
                    <span className={styles.listItemText}>{value.name}</span>
                )}
            />

            <div className={styles.detailPane}>
                {selectedPermission ? (
                    <Form<Permission>
                        key={selectedPermission.id}
                        form={selectedPermission}
                        title={selectedPermission.name}
                        saving={updateMutation.isPending}
                        onUpdate={setFormState}
                        onSave={handleSave}
                    >
                        <FormGroup title="Details">
                            <TextField label="Name" field="name" required />
                        </FormGroup>
                    </Form>
                ) : (
                    <div className={styles.emptyState}>
                        No permission selected
                    </div>
                )}
            </div>
        </>
    )
}
