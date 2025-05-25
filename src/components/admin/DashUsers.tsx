'use client'
import { useState, useEffect } from "react"
import { IUser } from "@/models/User"
import { IRole } from "@/models/Role"

export default function DashUsers() {
    const [sectionData, setSectionData] = useState<IUser[]>([])
    const [selectedEntry, setSelectedEntry] = useState<IUser | null>(null)
    const [roleList, setRoleList] = useState<IRole[]>([])
    const [refreshData, setRefreshData] = useState<boolean>(false)
    const [, setLoading] = useState(true)
    const [, setError] = useState<string | null>(null)
    const [unsaved, setUnsaved] = useState<boolean>(false)

    useEffect(() => {
        const fetchData = async () => {
            try {

                setLoading(true)
                const [usersRes, rolesRes] = await Promise.all([
                    fetch("/api/admin/user"),
                    fetch("/api/admin/role")
                ])

                if (!usersRes.ok || !rolesRes.ok) throw new Error('Failed to fetch data')

                const [users, roles] = await Promise.all([
                    usersRes.json(),
                    rolesRes.json()
                ])

                setSectionData(users)
                setRoleList(roles)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch data')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [refreshData])

    const updateSelectedUser = (updatedUser: IUser) => {
        setUnsaved(true)
        setSectionData(prev =>
            prev.map(user => user.discordId === updatedUser.discordId ? updatedUser : user)
        )
        setSelectedEntry(updatedUser)
    }

    const handleAddRole = (roleName: string) => {
        if (!selectedEntry) return

        if (selectedEntry.roles.find(role => role.name === roleName)) return

        const roleToAdd = roleList.find(role => role.name === roleName)
        if (!roleToAdd) return

        const updatedUser: IUser = { ...selectedEntry } as IUser
        updatedUser.roles = [...selectedEntry.roles, roleToAdd]
        updateSelectedUser(updatedUser)
    }

    const handleChangeSelection = (usr: IUser) => {
        if (!unsaved) {
            setSelectedEntry(usr)
        } else {
            alert("Please save your changes before moving on.")
        }
    }

    const handleRemoveRole = (roleName: string) => {
        if (!selectedEntry) return

        const updatedUser: IUser = { ...selectedEntry } as IUser
        updatedUser.roles = selectedEntry.roles.filter(role => role.name !== roleName)
        updateSelectedUser(updatedUser)
    }

    const handleSaveChanges = async () => {
        try {
            const response = await fetch('/api/admin/user', {
                method: "PATCH",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify([selectedEntry])
            })

            if (!response.ok) throw new Error('Failed to save changes')
            setRefreshData(!refreshData)
            setUnsaved(false)
            alert("Save Successful")
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save changes')
            alert("Saving Failed")
        }
    }

    interface IUserDetailProps {
        label: string,
        value: React.ReactNode,
        doDiv?: boolean
    }
    
    const UserDetailRow = ({ label, value, doDiv=true }: IUserDetailProps) => (
        <div className={`flex flex-col gap-2 py-2 md:grid md:grid-cols-3 md:gap-4 ${doDiv ? "border-b" : ""}`}>
            <span className="text-sm font-medium text-gray-700 md:text-base">{label}</span>
            <span className="col-span-2 break-words text-sm text-gray-600 md:text-base">
                {value || 'N/A'}
            </span>
        </div>
    );

    return (
        <div className="grid h-full min-h-screen grid-cols-1 gap-4 bg-gray-50 pb-16 lg:h-full lg:min-h-0 lg:grid-cols-3 lg:pb-4">
            {/* User List */}
            <div className="rounded-lg bg-white p-3 shadow-sm md:p-4 lg:col-span-1">
                <h2 className="mb-2 text-lg font-semibold text-black-pearl-dark md:mb-4 md:text-xl">Members</h2>
                <ul className="space-y-1 md:space-y-2">
                    {sectionData.map(user => (
                        <li
                            key={user.discordId}
                            className={`cursor-pointer rounded-lg p-2 text-sm transition-colors md:p-3 md:text-base ${selectedEntry?.discordId === user.discordId
                                    ? 'border-blue-500 bg-blue-100'
                                    : 'hover:bg-gray-100'
                                }`}
                            onClick={() => { handleChangeSelection(user); }}
                        >
                            <div className="truncate font-medium">{user.name}</div>
                            <div className="truncate text-xs text-gray-500 md:text-sm">{user.email}</div>
                        </li>
                    ))}
                </ul>
            </div>

            {/* User Details */}
            {selectedEntry ? (
                <div className="rounded-lg bg-white p-4 shadow-sm md:p-6 lg:col-span-2">
                    <div className="space-y-2 md:space-y-4">
                        <h2 className="text-lg font-semibold text-black-pearl-dark md:text-xl">Member Details</h2>
                        
                        <UserDetailRow label="Discord Username" value={selectedEntry.name} />
                        <UserDetailRow label="Nickname" value={selectedEntry.preferredName} />
                        <UserDetailRow label="Email" value={selectedEntry.email} />
                        <UserDetailRow label="Discord ID" value={selectedEntry.discordId} />
                        <UserDetailRow label="Address Line 1" value="N/A" doDiv={false} />
                        <UserDetailRow label="Address Line 2" value="N/A" doDiv={false} />
                        <UserDetailRow label="City" value={selectedEntry.city} doDiv={false} />
                        <UserDetailRow label="County" value={selectedEntry.county} doDiv={false} />
                        <UserDetailRow label="State" value={selectedEntry.state} doDiv={false} />
                        <UserDetailRow label="Zip Code" value={selectedEntry.zipCode} />

                        <UserDetailRow
                            label="Roles"
                            value={
                                <div className="flex flex-wrap gap-1 md:gap-2">
                                    {selectedEntry.roles.map(role => (
                                        <span
                                            key={role.name}
                                            className="rounded-full bg-gray-200 px-2 py-1 text-xs md:text-sm"
                                        >
                                            {role.name}
                                        </span>
                                    ))}
                                </div>
                            }
                        />

                        <div className="mt-4 space-y-2 md:mt-6 md:space-y-4">
                            <div className="flex flex-col gap-2 md:flex-row md:gap-4">
                                <select
                                    className="w-full rounded border p-1 text-sm md:p-2 md:text-base"
                                    onChange={(e) => { handleAddRole(e.target.value); }}
                                    value=""
                                >
                                    <option value="">Add Role</option>
                                    {roleList.map(role => (
                                        <option key={role.name} value={role.name}>
                                            {role.name}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    className="w-full rounded border p-1 text-sm md:p-2 md:text-base"
                                    onChange={(e) => { handleRemoveRole(e.target.value); }}
                                    value=""
                                >
                                    <option value="">Remove Role</option>
                                    {selectedEntry.roles.map(role => (
                                        <option key={role.name} value={role.name}>
                                            {role.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={handleSaveChanges}
                                className="w-full rounded bg-blue-600 px-3 py-1 text-sm text-white transition-colors hover:bg-blue-700 active:outline active:outline-offset-2 active:outline-blue-500 md:px-4 md:py-2 md:text-base"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-center p-4 text-sm text-gray-500 md:text-base lg:col-span-2">
                    Select a member to view details
                </div>
            )}
        </div>
    )
}