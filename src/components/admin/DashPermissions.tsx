'use client'

import { useState, useEffect, FormEvent } from "react"
import { IPermission } from "@/models/Permission"
import { ToolTip } from "../ToolTip"
import { Popup } from "../Popup"

export default function DashPermissions() {
    const [sectionData, setSectionData] = useState<IPermission[]>([])
    const [selectedPerm, setSelectedPerm] = useState<IPermission | null>(null)
    const [refresh, setRefresh] = useState<boolean>(false)
    const [, setLoading] = useState(true)
    const [, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {

                setLoading(true)
                const permsRes = await fetch('/api/admin/permission')

                if (!permsRes.ok) throw new Error("Failed to fetch data")

                const perms = await permsRes.json()

                setSectionData(perms)
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to fetch data")
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [refresh])

    useEffect(() => {
        if (selectedPerm && !sectionData.find(x => x.name === selectedPerm.name)) {
            setSelectedPerm(null)
        }
    }, [sectionData, selectedPerm])

    const handleCreatePerm = async (permName: string) => {
        console.log("creating: " + permName)
        if (permName === "") return
        const perm: IPermission = {
            name: permName
        } as IPermission
        await fetch('/api/admin/permission', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application-json'
            },
            body: JSON.stringify([perm])
        })
        //trigger refresh
        setRefresh(!refresh)
    }

    const handleDeletePerm = async (permName: string) => {
        console.log("deleting: " + permName)
        const toDelete = sectionData.find(perm => perm.name === permName)
        await fetch('/api/admin/permission', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application-json'
            },
            body: JSON.stringify(toDelete)
        })
        //trigger refresh
        setRefresh(!refresh)
    }

    const PermDetailRow = ({ label, value }: { label: string, value: React.ReactNode }) => (
        <div className="flex flex-col md:grid md:grid-cols-3 gap-2 md:gap-4 py-2 border-b">
            <span className="font-medium text-gray-700 text-sm md:text-base">{label}</span>
            <span className="col-span-2 text-gray-600 text-sm md:text-base break-words">
                {value || 'N/A'}
            </span>
        </div>
    )

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 lg:min-h-0 lg:h-full lg:pb-4 gap-4 h-full bg-gray-50 min-h-screen b-gray-50 pb-16">
            {/* Perm List */}
            <div className="flex flex-col lg:col-span-1 bg-white rounded-lg shadow-sm p-3 md:p-4">
                <div className="grow">
                    <h2 className="text-lg md:text-xl font-semibold mb-2 md:mb-4">Permissions</h2>
                    <ul className="space-y-1 md:space-y-2">
                        {sectionData.map(perm => (
                            <li
                                key={perm.name}
                                className={`p-2 md:p-3 rounded-lg cursor-pointer transition-colors text-sm md:text-base ${selectedPerm?.name === perm.name
                                        ? 'bg-blue-100 border-blue-500'
                                        : 'hover:bg-gray-100'
                                    }`}
                                onClick={() => setSelectedPerm(perm)}
                            >
                                <div className="font-medium relative">
                                    {perm.name}
                                    <ToolTip
                                        label="..."
                                        triggerClasses="float-right hover:bg-blue-500 px-2 rounded"
                                        containerClasses="bg-white p-1 rounded"
                                    >
                                        <>
                                            <button
                                                onClick={(ev) => {
                                                    handleDeletePerm(perm.name)
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
                        label="Add Permission"
                        triggerClasses="w-full rounded bg-blue-600 hover:bg-blue-700 text-white transition-colors text-sm py-2"
                        containerClasses="bg-white w-[400px] p-2 rounded border"
                    >
                        <div>
                            <h2 className="text-lg">Add Permission</h2>
                            <form className="closer" action="javascript:void(0);" onSubmit={(ev: FormEvent<HTMLFormElement>) => {
                                const item: HTMLInputElement = ev.currentTarget.elements.namedItem("pName") as HTMLInputElement
                                if (!item) return false
                                handleCreatePerm(item.value)
                                ev.target.dispatchEvent(new Event('closepm'))
                            }}>
                                <label htmlFor="rName">Permission Name:</label>
                                <input className="float-right border border-blue-500 rounded" type="text" id="pName" name="pName" /><br />
                                <div className="mt-6">
                                    <button
                                        className="text-white closer rounded px-2 py-1 bg-blue-600 hover:bg-blue-700"
                                        onClick={(ev) => {
                                            ev.target.dispatchEvent(new Event('closepm'))
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <input className="text-white cursor-pointer float-right bg-blue-600 hover:bg-blue-700 rounded px-2 py-1" type="submit" value="Submit" />
                                </div>
                            </form>
                        </div>
                    </Popup>
                </div>
            </div>
            {/* Perm Details */}
            {selectedPerm ? (
                <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-4 md:p-6">
                    <div className="space-y-2 md:space-y-4">
                        <h2 className="text-lg md:text-xl font-semibold">Permission Details</h2>

                        <PermDetailRow label="Name" value={selectedPerm.name} />
                    </div>
                </div>
            ) : (
                <div className="lg:col-span-2 flex items-center justify-center text-gray-500 text-sm md:text-base p-4">
                    Select a permission to view details
                </div>
            )}
        </div>
    )
}