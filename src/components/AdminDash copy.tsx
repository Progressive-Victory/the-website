'use client'
import { useState, useEffect } from "react"
import { MainLayout } from "./MainLayout"
import { IUser } from "@/models/User"

export function AdminDash() {
    enum Section {
        Users,
        Roles,
        Permissions,
        Pages
    }

    const sectionArray = Object.values(Section).filter((value) => (
        isNaN(Number(value))
    ))
    
    const [section, setSection] = useState<number>(Section.Users)
    const [data, setData] = useState<IUser[]>()
    const [selectedEntry, setSelectedEntry] = useState<IUser>()

    useEffect(() => {
        const getSectionData = async () => {
            const response = await fetch("/api/admin/user")
            const data = await response.json()
            setSectionData(data)
        }
        getSectionData()
    }, [section])

    return (
        <MainLayout>
            <div className="relative items-center bg-steel-blue w-full h-screen">
                <div className="absolute top-0 left-0 w-full h-full halftone opacity-10 z-2"/>
                <div className="relative h-full z-1 grid grid-cols-12 gap-x-4 opacity-90">
                    <div className="col-span-2 h-full bg-white p-4">
                        <h1>Admin Portal</h1>
                        <br/>
                        <ul>
                            {sectionArray.map((value, index) => (
                                <li className={"p-2 " + (value == Section[section] ? "bg-sky-700" : "hover:bg-sky-500")}
                                 onClick={() => (
                                    setSection(index)
                                )} >
                                    <a>{value}</a>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="col-span-6 h-full bg-white p-4">
                            <h1>{Section[section]}</h1>
                            <br/>
                            <ul>
                                {sectionData?.map((entry, index) => (
                                    <li className={"p-2 " + (entry == selectedEntry"hover:bg-sky-500")}>
                                        <a>{entry.name}</a>
                                    </li>
                                ))}
                            </ul>
                    </div>
                    <div className="col-span-4 h-full bg-white p-4">

                    </div>
                </div>
            </div>
        </MainLayout>
    )
}