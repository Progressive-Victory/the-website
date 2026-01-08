'use client'

import PaginatedList from '@/components/admin/PaginatedList'
import { Form, FormGroup, TextField } from '@/components/form'
import { IPermission, zPermission } from '@/contracts/data'
import deepEqual from 'deep-equal'
import { useRef, useState } from 'react'

export default function Page() {
    const eventTarget = useRef(new EventTarget())

    // We save the original value we got from the API so that we can easily
    // discard changes without saving
    const [originalPermission, setOriginalPermission] =
        useState<IPermission | null>(null)
    // This is the mutable copy we actually update when the user interacts with
    // the form
    const [selectedPermission, setSelectedPermission] =
        useState<IPermission | null>(null)
    const [permissions, setPermissions] = useState<IPermission[]>([])

    const handleSelectItem = (value: IPermission) => {
        if (value.id === selectedPermission?.id) return

        if (!deepEqual(selectedPermission, originalPermission)) {
            const proceed = confirm(
                'You have unsaved changes! Selecting a new list element will discard them.'
            )
            if (!proceed) return
        }

        // We need to copy to make sure that the value in the list is not
        // modified until we save
        setSelectedPermission({ ...value } as IPermission)
        setOriginalPermission({ ...value } as IPermission)
    }

    const makeItem = (permission: IPermission) => ({
        id: permission.id.toString(),
        value: permission,
    })

    return (
        <>
            <PaginatedList<IPermission>
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
                    <span className="font-medium text-black">{value.name}</span>
                )}
            />
            <div className="h-[calc(100dvh-100px)] flex-1 overflow-y-auto">
                {selectedPermission && originalPermission ? (
                    <Form<IPermission>
                        zodSchema={zPermission}
                        initialValue={originalPermission}
                        setInitialValue={setOriginalPermission}
                        currentValue={selectedPermission}
                        setCurrentValue={setSelectedPermission}
                        computeTitle={(permission) => permission.name ?? ''}
                        patchEndpoint={`/permissions/${selectedPermission.id}`}
                        onChangesSaved={() => {
                            eventTarget.current.dispatchEvent(
                                new Event('refetch')
                            )
                        }}
                    >
                        <FormGroup title="Details">
                            <TextField name="Name" field="name" required />
                        </FormGroup>
                    </Form>
                ) : (
                    <div className="flex h-full items-center justify-center">
                        No permission selected
                    </div>
                )}
            </div>
        </>
    )
}
