'use client'

import { useState, useEffect, FormEvent, ChangeEvent } from 'react'
import { IRole } from '@/models/Role'
import { IPermission } from '@/models/Permission'
import { ToolTip } from '../ToolTip'
import { Popup } from '../Popup'

export default function DashRoles() {
    const [sectionData, setSectionData] = useState<IRole[]>([])
    const [filteredData, setFilteredData] = useState<IRole[]>([])
    const [selectedRole, setSelectedRole] = useState<IRole | null>(null)
    const [permissionList, setPermissionList] = useState<IPermission[]>([])
    const [refresh, setRefresh] = useState<boolean>(false) //this is cursed but it seems like the best way to trigger refresh on callback
    const [unsaved, setUnsaved] = useState<boolean>(false)
    const [, setLoading] = useState(true)
    const [, setError] = useState<string | null>(null)
    const [search, setSearch] = useState<string | null>('')

    //pull page data from database. Triggers on both component initialization and the trigger of the refresh state
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const [rolesRes, permsRes] = await Promise.all([
                    fetch('/api/admin/role'),
                    fetch('/api/admin/permission'),
                ])

                if (!rolesRes.ok || !permsRes.ok)
                    throw new Error('Failed to fetch data')

                const [roles, perms] = await Promise.all([
                    rolesRes.json(),
                    permsRes.json(),
                ])

                setSectionData(roles)
                setPermissionList(perms)
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : 'Failed to fetch data'
                )
            } finally {
                setLoading(false)
            }
        }
        void fetchData()
    }, [refresh])

    useEffect(() => {
        const filteredRoles: IRole[] = []
        const lowerCaseSearch = search ? search.toLowerCase() : ''
        for (const role of sectionData) {
            if (
                search === null ||
                role.name.toLowerCase().includes(lowerCaseSearch)
            ) {
                filteredRoles.push(role)
            }
        }
        setFilteredData(filteredRoles)
    }, [sectionData, search])

    //if sectionData has been changed then check to see if the currently displayed role still exists. If not set selectedRole to null
    useEffect(() => {
        if (
            selectedRole &&
            !sectionData.find((x) => x.name === selectedRole.name)
        ) {
            setSelectedRole(null)
        }
    }, [sectionData, selectedRole])

    //this will be used to update values of existing roles when I implement that
    const updateSelectedRole = (updatedRole: IRole) => {
        setUnsaved(true)
        setSectionData((prev) =>
            prev.map((role) =>
                role.name === updatedRole.name ? updatedRole : role
            )
        )
        setSelectedRole(updatedRole)
    }

    const updateSearch = (event: ChangeEvent<HTMLInputElement>) => {
        const newValue = event.currentTarget.value
        setSearch(newValue)
    }

    const handleChangeSelection = (role: IRole) => {
        if (!unsaved) {
            setSelectedRole(role)
        } else {
            alert('Please save your changes before moving on.')
        }
    }

    //this will be used to add perms to existing roles when its implemented
    const handleAddPerm = (permName: string) => {
        console.log('Adding perm: ' + permName)

        if (!selectedRole) return

        if (selectedRole.permissions.find((perm) => permName === perm.name))
            return

        const permToAdd = permissionList.find((perm) => perm.name === permName)
        if (!permToAdd) return

        const updatedRole: IRole = { ...selectedRole } as IRole
        updatedRole.permissions = [...selectedRole.permissions, permToAdd]
        updateSelectedRole(updatedRole)
    }

    //this will be used to remove perms from existing roles when implemented
    const handleRemovePerm = (permName: string) => {
        console.log('Removing perm: ' + permName)

        if (!selectedRole) return

        const updatedRole: IRole = { ...selectedRole } as IRole
        updatedRole.permissions = selectedRole.permissions.filter(
            (perm) => perm.name !== permName
        )
        updateSelectedRole(updatedRole)
    }

    //handles creating new roles given a name string by creating an object and shooting it to the api
    const handleCreateRole = async (roleName: string) => {
        if (roleName === '') return
        const role: IRole = {
            name: roleName,
            permissions: new Array<IPermission>(),
        } as IRole
        await fetch('/api/admin/role', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application-json',
            },
            body: JSON.stringify([role]),
        })
        //trigger refresh
        setRefresh(!refresh)
    }

    //handles deleting roles given a name string by finding the corresponding role in sectionData and shooting it to api for deletion
    const handleDeleteRole = async (roleName: string) => {
        console.log('Deleting role: ' + roleName)
        const toDelete = sectionData.find((role) => role.name === roleName)
        await fetch('/api/admin/role', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application-json',
            },
            body: JSON.stringify(toDelete),
        })
        //trigger refresh
        setRefresh(!refresh)
    }

    //handles saving changes made on existing roles
    const handleSaveChanges = async () => {
        console.log('Saving Changes...')
        try {
            const response = await fetch('/api/admin/role', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify([selectedRole]),
            })

            if (!response.ok) throw new Error('Failed to save changes')
            setRefresh(!refresh)
            setUnsaved(false)
            alert('Save Successful')
        } catch (err) {
            setError(
                err instanceof Error ? err.message : 'Failed to save changes'
            )
            alert('Saving Failed')
        }
    }

    const RoleDetailRow = ({
        label,
        value,
    }: {
        label: string
        value: React.ReactNode
    }) => (
        <div className="flex flex-col gap-2 border-b py-2 md:grid md:grid-cols-3 md:gap-4">
            <span className="text-sm font-medium text-gray-700 md:text-base">
                {label}
            </span>
            <span className="col-span-2 break-words text-sm text-gray-600 md:text-base">
                {value ?? 'N/A'}
            </span>
        </div>
    )

    return (
        <div className="b-gray-50 grid h-full min-h-screen grid-cols-1 gap-4 bg-gray-50 pb-16 lg:h-full lg:min-h-0 lg:grid-cols-3 lg:pb-4">
            {/* Role List */}
            <div className="flex flex-col rounded-lg bg-white p-3 shadow-sm md:p-4 lg:col-span-1">
                <div className="grow">
                    <h2 className="mb-2 text-lg font-semibold md:mb-4 md:text-xl">
                        Roles
                    </h2>
                    <input
                        className="w-full rounded-md border border-steel-blue bg-white px-4 py-2 ring-steel-blue"
                        value={search ?? ''}
                        onChange={(e) => updateSearch(e)}
                    />
                    <ul className="space-y-1 md:space-y-2">
                        {filteredData.map((role) => (
                            <li
                                key={role.name}
                                className={`cursor-pointer rounded-lg p-2 text-sm transition-colors md:p-3 md:text-base ${
                                    selectedRole?.name === role.name
                                        ? 'border-blue-500 bg-blue-100'
                                        : 'hover:bg-gray-100'
                                }`}
                                onClick={() => handleChangeSelection(role)}
                            >
                                <div className="relative font-medium">
                                    {role.name}
                                    <ToolTip
                                        label="..."
                                        triggerClasses="float-right hover:bg-blue-500 px-2 rounded"
                                        containerClasses="bg-white p-1 rounded"
                                    >
                                        <>
                                            <button
                                                onClick={(ev) => {
                                                    void handleDeleteRole(
                                                        role.name
                                                    )
                                                    ev.target.dispatchEvent(
                                                        new Event('closettm')
                                                    )
                                                }}
                                                className="closer rounded px-2 hover:bg-blue-500"
                                            >
                                                Delete
                                            </button>
                                        </>
                                    </ToolTip>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <Popup
                        label="Add Role"
                        triggerClasses="w-full rounded bg-blue-600 hover:bg-blue-700 text-white transition-colors text-sm py-2"
                        containerClasses="bg-white w-[400px] p-2 rounded border"
                    >
                        <div>
                            <h2 className="text-lg">Add Role</h2>
                            <form
                                className="closer"
                                action="javascript:void(0);"
                                onSubmit={(ev: FormEvent<HTMLFormElement>) => {
                                    const item: HTMLInputElement =
                                        ev.currentTarget.elements.namedItem(
                                            'rName'
                                        ) as HTMLInputElement
                                    if (!item) return false
                                    void handleCreateRole(item.value)
                                    ev.target.dispatchEvent(
                                        new Event('closepm')
                                    )
                                }}
                            >
                                <label htmlFor="rName">Role Name:</label>
                                <input
                                    className="float-right rounded border border-blue-500"
                                    type="text"
                                    id="rName"
                                    name="rName"
                                />
                                <br />
                                <div className="mt-6">
                                    <button
                                        className="closer rounded bg-blue-600 px-2 py-1 text-white hover:bg-blue-700"
                                        onClick={(ev) => {
                                            ev.target.dispatchEvent(
                                                new Event('closepm')
                                            )
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <input
                                        className="float-right cursor-pointer rounded bg-blue-600 px-2 py-1 text-white hover:bg-blue-700"
                                        type="submit"
                                        value="Submit"
                                    />
                                </div>
                            </form>
                        </div>
                    </Popup>
                </div>
            </div>
            {/* Role Details */}
            {selectedRole ? (
                <div className="rounded-lg bg-white p-4 shadow-sm md:p-6 lg:col-span-2">
                    <div className="space-y-2 md:space-y-4">
                        <h2 className="text-lg font-semibold md:text-xl">
                            Role Details
                        </h2>

                        <RoleDetailRow label="Name" value={selectedRole.name} />
                        <RoleDetailRow
                            label="Permissions"
                            value={
                                <div className="flex flex-wrap gap-1 md:gap-2">
                                    {selectedRole.permissions.length > 0 ? (
                                        selectedRole.permissions.map((perm) => (
                                            <span
                                                key={perm.name}
                                                className="rounded-full bg-gray-200 px-2 py-1 text-xs md:text-sm"
                                            >
                                                {perm.name}
                                            </span>
                                        ))
                                    ) : (
                                        <div className="text-sm text-gray-500 md:text-base">
                                            None
                                        </div>
                                    )}
                                </div>
                            }
                        />

                        <div className="mt-4 space-y-2 md:mt-6 md:space-y-4">
                            <div className="flex flex-col gap-2 md:flex-row md:gap-4">
                                <select
                                    className="w-full rounded border p-1 text-sm md:p-2 md:text-base"
                                    onChange={(e) =>
                                        handleAddPerm(e.target.value)
                                    }
                                    value=""
                                >
                                    <option value="">Add Permission</option>
                                    {permissionList.map((perm) => (
                                        <option
                                            key={perm.name}
                                            value={perm.name}
                                        >
                                            {perm.name}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    className="w-full rounded border p-1 text-sm md:p-2 md:text-base"
                                    onChange={(e) =>
                                        handleRemovePerm(e.target.value)
                                    }
                                    value=""
                                >
                                    <option value="">Remove Permission</option>
                                    {selectedRole.permissions.map((perm) => (
                                        <option
                                            key={perm.name}
                                            value={perm.name}
                                        >
                                            {perm.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={void handleSaveChanges}
                                className="w-full rounded bg-blue-600 px-3 py-1 text-sm text-white transition-colors hover:bg-blue-700 active:outline active:outline-offset-2 active:outline-blue-500 md:px-4 md:py-2 md:text-base"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-center p-4 text-sm text-gray-500 md:text-base lg:col-span-2">
                    Select a role to view details
                </div>
            )}
        </div>
    )
}
