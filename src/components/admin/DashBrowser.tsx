'use client'

import { useState, useEffect, cloneElement } from "react"
import { Document } from "mongoose"
import { ToolTip } from "../ToolTip"
import { Popup } from "../Popup"
import { FormEvent } from "react"
import DetailRow, { IDetailProps } from "./DetailRow"

export default function DashBrowser<T extends Document>(
    {
        apiStr,
        title,
        displayKey
    } : {
        apiStr: string,
        title: string,
        displayKey: string,
    }
){
    const [sectionData, setSectionData] = useState<T[]>([])
    const [selectedEntry, setSelectedEntry] = useState<T | null>(null)
    const [pageNumber, setPageNumber] = useState<number>(1)
    const [entriesPerPage, setEntriesPerPage] = useState<number>(15)
    const [refresh, setRefresh] = useState<boolean>(false)
    const [, setLoading] = useState(true)
    const [, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const res = await fetch(apiStr)

                if (!res.ok) throw new Error("Failed to fetch data.")

                const data = await res.json()

                setSectionData(data)
            } catch(err) {
                setError(err instanceof Error ? err.message : "Failed to fetch data.")
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [refresh])

    useEffect(() => {
        if (selectedEntry && !sectionData.find(x => x._id === selectedEntry._id)) {
            setSelectedEntry(null)
        }
    }, [sectionData, selectedEntry])

    const serveField = (key: string) => {
        
    }

    const handleCreateT = async (pk: string) => {
        console.log(`creating: ${pk}`)
    }

    const handleDeleteT = async (pk: string) => {
        console.log(`deleting: ${pk}`)
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 lg:min-h-0 lg:h-full lg:pb-4 gap-4 h-full bg-gray-50 min-h-screen b-gray-50 pb-16">
            {/* Browser Section */}
            <div className="flex flex-col lg:col-span-1 bg-white rounded-lg shadow-sm p-3 md:p-4">
                <div className="grow">
                    <h2 className="text-lg md:text-xl font-semibold mb-2 md:mb-4">{`${title}s`}</h2>
                    <ul className="space-y-1 md:space-y-2">
                        {sectionData.map((entry: T) => (
                            <li
                                key={entry._id as string}
                                className={`p-2 md:p-3 rounded-lg cursor-pointer transition-colors text-sm md:text-base ${selectedEntry?._id === entry._id
                                        ? 'bg-blue-100 border-blue-500'
                                        : 'hover:bg-gray-100'
                                    }`}
                                onClick={() => setSelectedEntry(entry)}
                            >
                                <div className="font-medium relative">
                                    {(entry[displayKey as keyof T]) as string}
                                    <ToolTip
                                        label="..."
                                        triggerClasses="float-right hover:bg-blue-500 px-2 rounded"
                                        containerClasses="bg-white p-1 rounded"
                                    >
                                        <>
                                            <button
                                                onClick={(ev) => {
                                                    handleDeleteT(entry._id as string)
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
                        label={`Add ${title}`}
                        triggerClasses="w-full rounded bg-blue-600 hover:bg-blue-700 text-white transition-colors text-sm py-2"
                        containerClasses="bg-white w-[400px] p-2 rounded border"
                    >
                        <div>
                            <h2 className="text-lg">{`Add ${title}`}</h2>
                            <form className="closer" action="javascript:void(0);" onSubmit={(ev: FormEvent<HTMLFormElement>) => {
                                const item: HTMLInputElement = ev.currentTarget.elements.namedItem("pName") as HTMLInputElement
                                if (!item) return false
                                handleCreateT(item.value)
                                ev.target.dispatchEvent(new Event('closepm'))
                            }}>
                                <label htmlFor="rName">{`${title} Name:`}</label>
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
            {/* Detail Viewer */}
            {selectedEntry ? (
                <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-4 md:p-6">
                    <div className="space-y-2 md:space-y-4">
                        <h2 className="text-lg md:text-xl font-semibold text-black-pearl-dark">{`${title} Details`}</h2>
                        <form>
                            {Object.keys(selectedEntry).map(key => (
                                <div key={key}>
                                    <p>{key as string}</p>
                                    <p>{selectedEntry[key as keyof T] as string}</p>
                                </div>
                            ))} 
                        </form>
                    </div>
                </div>
            ) : (
                <div className="lg:col-span-2 flex items-center justify-center text-gray-500 text-sm md:text-base p-4">
                    {`Select a ${title} to view details`}
                </div>
            )}
        </div>
    )
}