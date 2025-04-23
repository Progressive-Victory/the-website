'use client'
import { useState, useEffect } from "react"
import { IUser } from "@/models/User"


export function UsersDash() {

    const [sectionData, setSectionData] = useState<IUser[]>()
    const [selectedEntry, setSelectedEntry] = useState<IUser>()

    useEffect(() => {
        const getSectionData = async () => {
            const response = await fetch("/api/admin/user")
            const data = await response.json()
            setSectionData(data)
        }
        getSectionData()
    }, [])

    function serveUserReadout() {
        console.log(selectedEntry)
        if(!selectedEntry) return
        return (
            <>
                <a>Name: {selectedEntry.name}</a>
                <a>Discord Id: {selectedEntry.discordId}</a>
            </>
        )
    }

    return (
        <>
            <div className="grid gap-x-4 grid-cols-10 h-full">
                <div className="col-span-6 h-full bg-white p-4">
                    <h1>Users</h1>
                    <br/>
                    <ul>
                        {sectionData?.map((entry) => (
                            <li className={"p-2 " + (entry == selectedEntry ? "bg-sky-700" : "hover:bg-sky-500")} 
                            onClick={ () => (
                                setSelectedEntry(entry)
                            )}>
                                <a>{entry.name}</a>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="col-span-4 h-full bg-white p-4">
                    <p>Name: {selectedEntry?.name}</p>
                    <a>Discord Id: {selectedEntry?.discordId}</a>
                </div>
            </div>
        </>
    )
}