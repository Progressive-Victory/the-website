'use client'
import { useState, useEffect, ChangeEvent } from "react"
import { IUser } from "@/models/User"
import { IRole } from "@/models/Role"

export default function DashUsers() {
    const [sectionData, setSectionData] = useState<IUser[]>([])
    const [filteredData, setFilteredData] = useState<IUser[]>([])
    const [selectedEntry, setSelectedEntry] = useState<IUser | null>(null)
    const [roleList, setRoleList] = useState<IRole[]>([])
    const [refreshData, setRefreshData] = useState<boolean>(false)
    const [, setLoading] = useState(true)
    const [, setError] = useState<string | null>(null)
    const [unsaved, setUnsaved] = useState<boolean>(false)
    const [search, setSearch] = useState<string | null>("");

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

    useEffect(() => {
        const filteredUsers: IUser[] = []
        for (const user of sectionData) {
            if (search === null || user.name.includes(search) || user.email.includes(search)) {
                filteredUsers.push(user)
            }
        }
        setFilteredData(filteredUsers)
    }, [sectionData, search])

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

    const updateSearch = (event: ChangeEvent<HTMLInputElement>) => {
        const newValue = event.currentTarget.value
        setSearch(newValue)
    }

    interface IUserDetailProps {
        label: string,
        value: React.ReactNode,
        doDiv?: boolean
    }
    
    const UserDetailRow = ({ label, value, doDiv=true }: IUserDetailProps) => (
        <div className={`flex flex-col md:grid md:grid-cols-3 gap-2 md:gap-4 py-2 ${doDiv ? "border-b" : ""}`}>
            <span className="font-medium text-gray-700 text-sm md:text-base">{label}</span>
            <span className="col-span-2 text-gray-600 text-sm md:text-base break-words">
                {value || 'N/A'}
            </span>
        </div>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full bg-gray-50 min-h-screen lg:min-h-0 lg:h-full pb-16 lg:pb-4">
            {/* User List */}
            <div className="lg:col-span-1 bg-white rounded-lg shadow-sm p-3 md:p-4">
                <h2 className="text-lg md:text-xl font-semibold mb-2 md:mb-4 text-black-pearl-dark">Members</h2>
                <input className="bg-white rounded-md w-full px-4 py-2 ring-steel-blue border border-steel-blue" value={search ? search : ""} onChange={(e) => updateSearch(e)} />
                <ul className="space-y-1 md:space-y-2">
                    {filteredData.map(user => (
                        <li
                            key={user.discordId}
                            className={`p-2 md:p-3 rounded-lg cursor-pointer transition-colors text-sm md:text-base ${selectedEntry?.discordId === user.discordId
                                    ? 'bg-blue-100 border-blue-500'
                                    : 'hover:bg-gray-100'
                                }`}
                            onClick={() => handleChangeSelection(user)}
                        >
                            <div className="font-medium truncate">{user.name}</div>
                            <div className="text-xs md:text-sm text-gray-500 truncate">{user.email}</div>
                        </li>
                    ))}
                </ul>
            </div>

            {/* User Details */}
            {selectedEntry ? (
                <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-4 md:p-6">
                    <div className="space-y-2 md:space-y-4">
                        <h2 className="text-lg md:text-xl font-semibold text-black-pearl-dark">Member Details</h2>
                        
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
                                            className="px-2 py-1 bg-gray-200 rounded-full text-xs md:text-sm"
                                        >
                                            {role.name}
                                        </span>
                                    ))}
                                </div>
                            }
                        />

                        <div className="mt-4 md:mt-6 space-y-2 md:space-y-4">
                            <div className="flex flex-col md:flex-row gap-2 md:gap-4">
                                <select
                                    className="w-full p-1 md:p-2 border rounded text-sm md:text-base"
                                    onChange={(e) => handleAddRole(e.target.value)}
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
                                    className="w-full p-1 md:p-2 border rounded text-sm md:text-base"
                                    onChange={(e) => handleRemoveRole(e.target.value)}
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
                                className="w-full py-1 md:py-2 px-3 md:px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm md:text-base active:outline active:outline-offset-2 active:outline-blue-500"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="lg:col-span-2 flex items-center justify-center text-gray-500 text-sm md:text-base p-4">
                    Select a member to view details
                </div>
            )}
        </div>
    )
}