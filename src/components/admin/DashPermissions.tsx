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
        <div className="flex flex-col gap-2 border-b py-2 md:grid md:grid-cols-3 md:gap-4">
            <span className="text-sm font-medium text-gray-700 md:text-base">{label}</span>
            <span className="col-span-2 break-words text-sm text-gray-600 md:text-base">
                {value || 'N/A'}
            </span>
        </div>
    )

    return (
        <div className="b-gray-50 grid h-full min-h-screen grid-cols-1 gap-4 bg-gray-50 pb-16 lg:h-full lg:min-h-0 lg:grid-cols-3 lg:pb-4">
            {/* Perm List */}
            <div className="flex flex-col rounded-lg bg-white p-3 shadow-sm md:p-4 lg:col-span-1">
                <div className="grow">
                    <h2 className="mb-2 text-lg font-semibold md:mb-4 md:text-xl">Permissions</h2>
                    <ul className="space-y-1 md:space-y-2">
                        {sectionData.map(perm => (
                            <li
                                key={perm.name}
                                className={`cursor-pointer rounded-lg p-2 text-sm transition-colors md:p-3 md:text-base ${selectedPerm?.name === perm.name
                                        ? 'border-blue-500 bg-blue-100'
                                        : 'hover:bg-gray-100'
                                    }`}
                                onClick={() => { setSelectedPerm(perm); }}
                            >
                                <div className="relative font-medium">
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
                                <input className="float-right rounded border border-blue-500" type="text" id="pName" name="pName" /><br />
                                <div className="mt-6">
                                    <button
                                        className="closer rounded bg-blue-600 px-2 py-1 text-white hover:bg-blue-700"
                                        onClick={(ev) => {
                                            ev.target.dispatchEvent(new Event('closepm'))
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <input className="float-right cursor-pointer rounded bg-blue-600 px-2 py-1 text-white hover:bg-blue-700" type="submit" value="Submit" />
                                </div>
                            </form>
                        </div>
                    </Popup>
                </div>
            </div>
            {/* Perm Details */}
            {selectedPerm ? (
                <div className="rounded-lg bg-white p-4 shadow-sm md:p-6 lg:col-span-2">
                    <div className="space-y-2 md:space-y-4">
                        <h2 className="text-lg font-semibold md:text-xl">Permission Details</h2>

                        <PermDetailRow label="Name" value={selectedPerm.name} />
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-center p-4 text-sm text-gray-500 md:text-base lg:col-span-2">
                    Select a permission to view details
                </div>
            )}
        </div>
    )
}