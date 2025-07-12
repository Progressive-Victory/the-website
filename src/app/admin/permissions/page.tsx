'use client'

import { Form } from '@/components/admin/Form'

import PaginatedList from '@/components/admin/PaginatedList'
import { IPermission } from '@/models/Permission'
import deepEqual from 'deep-equal'
import { useRef, useState } from 'react'

export default function () {
    const event_target = useRef(new EventTarget())

    // We save the original value we got from the API so that we can easily
    // discard changes without saving
    const [originalPermission, setOriginalPermission] =
        useState<IPermission | null>(null)
    // This is the mutable copy we actually update when the user interacts with
    // the form
    const [permission, setPermission] = useState<IPermission | null>(null)

    const beforeElementSelected = (_value: IPermission) => {
        if (!deepEqual(permission, originalPermission)) {
            return confirm(
                'You have unsaved changes! Selecting a new list element will discard them.'
            )
        }

        return true
    }

    const onElementSelected = (value: IPermission) => {
        setPermission({ ...value } as IPermission)
        // We need to copy to make sure that the value in the list is not
        // modified until we save
        setOriginalPermission({ ...value } as IPermission)
    }

    return (
        <>
            <PaginatedList<IPermission>
                event_target={event_target.current}
                api_endpoint="/api/admin/permissions"
                before_element_selection={beforeElementSelected}
                on_element_selected={onElementSelected}
                id_key="_id"
                display_key={'name'}
                filters={[]}
                search_fields={['name']}
            />
            <div className="h-[calc(100vh-100px)] flex-1 overflow-y-auto">
                {permission && originalPermission ? (
                    <Form<IPermission>
                        groups={[
                            {
                                fields: [
                                    {
                                        type: 'text',
                                        name: 'Name',
                                        key: 'name',
                                        required: true,
                                    },
                                ],
                            },
                        ]}
                        initialValue={originalPermission}
                        setInitialValue={setOriginalPermission}
                        currentValue={permission}
                        setCurrentValue={setPermission}
                        patchEndpoint="/api/admin/permissions"
                        onChangesSaved={() => {
                            event_target.current.dispatchEvent(
                                new Event('refetch')
                            )
                        }}
                    />
                ) : (
                    <div className="flex h-full items-center justify-center">
                        No permission selected
                    </div>
                )}
            </div>
        </>
    )
}
