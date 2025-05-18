'use client'

import { useState, useEffect, FormEvent } from "react"
import { IRole } from "@/models/Role"
import { IPermission } from "@/models/Permission"
import { ToolTip } from "./ToolTip"
import { Popup } from "./Popup"

export function RolesDash() {
    const [sectionData, setSectionData] = useState<IRole[]>([])
    const [selectedRole, setSelectedRole] = useState<IRole | null>(null)
    const [permissionList, setPermissionList] = useState<IPermission[]>([])
    const [refresh, setRefresh] = useState<boolean>(false) //this is cursed but it seems like the best way to trigger refresh on callback
    const [, setLoading] = useState(true)
    const [, setError] = useState<string | null>(null)

    //pull page data from database. Triggers on both component initialization and the trigger of the refresh state
    useEffect(() => {
        const fetchData = async () => {
            try {

                setLoading(true)
                const [rolesRes, permsRes] = await Promise.all([
                    fetch("/api/admin/role"),
                    fetch("/api/admin/permission")
                ])

                if (!rolesRes.ok || !permsRes.ok) throw new Error("Failed to fetch data")
                    
                const [roles, perms] = await Promise.all([
                    rolesRes.json(),
                    permsRes.json()
                ])

                setSectionData(roles)
                setPermissionList(perms)
            } catch(err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch data')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [refresh])

    //if sectionData has been changed then check to see if the currently displayed role still exists. If not set selectedRole to null
    useEffect(() => {
        if(selectedRole && !sectionData.find(x => x.name === selectedRole.name)) {
            setSelectedRole(null)
        }
    }, [sectionData, selectedRole])

    //this will be used to update values of existing roles when I implement that
    const updateSelectedRole = (updatedRole: IRole) => {
        setSectionData(prev => (
            prev.map(role => role.name === updatedRole.name ? updatedRole : role)
        ))
        setSelectedRole(updatedRole)
    }

    //this will be used to add perms to existing roles when its implemented
    const handleAddPerm = (permName: string) => {
        console.log("Adding perm: " + permName)

        if (!selectedRole) return

        if(selectedRole.permissions.find(perm => permName === perm.name)) return
        
        const permToAdd = permissionList.find(perm => perm.name === permName)
        if (!permToAdd) return

        const updatedRole: IRole = {...selectedRole} as IRole
        updatedRole.permissions = [...selectedRole.permissions, permToAdd]
        updateSelectedRole(updatedRole)
    }

    //this will be used to remove perms from existing roles when implemented
    const handleRemovePerm = (permName: string) => {
        console.log("Removing perm: " + permName)

        if(!selectedRole) return

        const updatedRole: IRole = { ...selectedRole } as IRole
        updatedRole.permissions = selectedRole.permissions.filter(perm => perm.name !== permName)
        updateSelectedRole(updatedRole)
    }

    //handles creating new roles given a name string by creating an object and shooting it to the api
    const handleCreateRole = async (roleName: string) => {
        if(roleName === "") return
        const role: IRole = {
            name: roleName,
            permissions: new Array<IPermission>()
        } as IRole
        await fetch('/api/admin/role', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application-json'
            },
            body: JSON.stringify([role])
        })
        //trigger refresh
        setRefresh(!refresh)
    }

    //handles deleting roles given a name string by finding the corresponding role in sectionData and shooting it to api for deletion
    const handleDeleteRole = async (roleName: string) => {
        console.log("Deleting role: " + roleName)
        const toDelete = sectionData.find(role => role.name === roleName)
        await fetch('/api/admin/role', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application-json'
            },
            body: JSON.stringify(toDelete)
        })
        //trigger refresh
        setRefresh(!refresh)
    }

    //handles saving changes made on existing roles
    const handleSaveChanges = async () => {
        console.log("Saving Changes...")
        try {
            const response = await fetch("/api/admin/role", {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(sectionData)
            })

            if (!response.ok) throw new Error('Failed to save changes')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save changes')
        }
    }

    const RoleDetailRow = ({label, value}: {label: string, value: React.ReactNode}) => (
        <div className="flex flex-col md:grid md:grid-cols-3 gap-2 md:gap-4 py-2 border-b">
            <span className="font-medium text-gray-700 text-sm md:text-base">{label}</span>
            <span className="col-span-2 text-gray-600 text-sm md:text-base break-words">
                {value || 'N/A'}
            </span>
        </div>
    )

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 lg:min-h-0 lg:h-full lg:pb-4 gap-4 h-full bg-gray-50 min-h-screen b-gray-50 pb-16">
            {/* Role List */}
            <div className="flex flex-col lg:col-span-1 bg-white rounded-lg shadow-sm p-3 md:p-4">
                <div className="grow">
                    <h2 className="text-lg md:text-xl font-semibold mb-2 md:mb-4">Roles</h2>
                    <ul className="space-y-1 md:space-y-2">
                        {sectionData.map(role => (
                            <li
                                key={role.name}
                                className={`p-2 md:p-3 rounded-lg cursor-pointer transition-colors text-sm md:text-base ${
                                    selectedRole?.name === role.name
                                    ? 'bg-blue-100 border-blue-500'
                                    : 'hover:bg-gray-100'
                                }`}
                                onClick={() => setSelectedRole(role)}
                                >
                                <div className="font-medium relative">
                                    {role.name}
                                    <ToolTip
                                        label="..."
                                        triggerClasses="float-right hover:bg-blue-500 px-2 rounded"
                                        containerClasses="bg-white p-1 rounded"
                                    >
                                        <>
                                            <button 
                                                onClick={(ev) => {
                                                    handleDeleteRole(role.name)
                                                    ev.target.dispatchEvent(new Event('closettm'))
                                                }}
                                                className="hover:bg-blue-500 px-2 rounded closer"
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
                            <form className="closer" action="javascript:void(0);" onSubmit={(ev: FormEvent<HTMLFormElement>) => {
                                    const item: HTMLInputElement = ev.currentTarget.elements.namedItem("rName") as HTMLInputElement
                                    if (!item) return false
                                    handleCreateRole(item.value)
                                    ev.target.dispatchEvent(new Event('closepm'))
                                }}>
                                <label htmlFor="rName">Role Name:</label>
                                <input className="float-right border border-blue-500 rounded" type="text" id="rName" name="rName"/><br/>
                                <div className="mt-6">
                                    <button
                                        className="text-white closer rounded px-2 py-1 bg-blue-600 hover:bg-blue-700"
                                        onClick={(ev) => {
                                            ev.target.dispatchEvent(new Event('closepm'))
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <input className="text-white cursor-pointer float-right bg-blue-600 hover:bg-blue-700 rounded px-2 py-1" type="submit" value="Submit"/>
                                </div>
                            </form>
                        </div>
                    </Popup>
                </div>
            </div>
            {/* Role Details */}
            {selectedRole ? (
                <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-4 md:p-6">
                    <div className="space-y-2 md:space-y-4">
                        <h2 className="text-lg md:text-xl font-semibold">Role Details</h2>

                        <RoleDetailRow label="Name" value={selectedRole.name} />
                        <RoleDetailRow 
                            label="Permissions" 
                            value={
                                <div className="flex flex-wrap gap-1 md:gap-2">
                                    {selectedRole.permissions.length > 0 ? (selectedRole.permissions.map(perm => (
                                        <span
                                            key={perm.name}
                                            className="px-2 py-1 bg-gray-200 rounded-full text-xs md:text-sm"
                                        >
                                            {perm.name}
                                        </span>
                                    ))) : 
                                        <div className="text-gray-500 text-sm md:text-base">None</div>
                                    }
                                </div>
                            }
                        />

                        <div className="mt-4 md:mt-6 space-y-2 md:space-y-4">
                            <div className="flex flex-col md:flex-row gap-2 md:gap-4">
                                <select
                                    className="w-full p-1 md:p-2 border rounded text-sm md:text-base"
                                    onChange={(e) => handleAddPerm(e.target.value)}
                                    value=""
                                >
                                    <option value="">Add Permission</option>
                                    {permissionList.map(perm => (
                                        <option key={perm.name} value={perm.name}>
                                            {perm.name}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    className="w-full p-1 md:p-2 border rounded text-sm md:text-base"
                                    onChange={(e) => handleRemovePerm(e.target.value)}
                                    value=""
                                >
                                    <option value="">Remove Permission</option>
                                    {selectedRole.permissions.map(perm => (
                                        <option key={perm.name} value={perm.name}>
                                            {perm.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={handleSaveChanges}
                                className="w-full py-1 md:py-2 px-3 md:px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="lg:col-span-2 flex items-center justify-center text-gray-500 text-sm md:text-base p-4">
                    Select a role to view details
                </div>
            )}
        </div>
    )
}