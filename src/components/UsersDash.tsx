'use client'
import { useState, useEffect } from "react"
import { IUser } from "@/models/User"
import { IRole } from "@/models/Role"

export function UsersDash() {

    const [sectionData, setSectionData] = useState<IUser[]>()
    const [selectedEntry, setSelectedEntry] = useState<IUser>()
    const [roleList, setRoleList] = useState<IRole[]>()

    useEffect(() => {
        const getSectionData = async () => {
            const response = await fetch("/api/admin/user")
            const data = await response.json()
            setSectionData(data)
        }
        const getRoleList = async () => {
            const response = await fetch()
            const data = await response.json()
            setRoleList(roleList)
        }
        getRoleList()
        getSectionData()
    }, [])

    function isIterable(obj:any): boolean {
        console.log("isIterable?: " + !!obj[Symbol.iterator])
        return Array.isArray(obj)
    }

    function iterableToString(obj:Array<any>): string[] {
        console.log
        //this will cause crashes if the user interface gets other arrays that contain docs without a name property in the future!!!
        return obj.map((value: any) => (value["name"]))
    }

    const addRole = (roleStr: string) => {
        console.log("Adding Role")
        //I guess cry?
    }

    const removeRole = (roleStr: string) => {
        console.log("Removing Role")
    }

    const saveChanges = () => {
        console.log("Saving Changes")
    }

    function serveUserReadout() {
        console.log(selectedEntry)
        if(!selectedEntry) return
        type userkey = keyof IUser
        const props = Object.keys(selectedEntry)
        return (
            <div className="flex h-full grid">
                <div className="overflow-scroll">
                    <table className="w-auto">
                        {props.map((key) => (
                            <tr key={key}>
                                <th className="p-1 border border-black">{key}</th>
                                <td className="break-all p-1 border border-black">{isIterable(selectedEntry[key as userkey]) ? iterableToString(selectedEntry[key as userkey]) : selectedEntry[key as userkey].toString()}</td>
                            </tr>
                        ))}
                    </table>
                </div>
                <div className="block self-end h-20 w-full">
                    <button className="w-1/3 h-full hover:bg-sky-500" onClick={addRole}>Add Role</button>
                    <button className="w-1/3 h-full hover:bg-sky-500" onClick={removeRole}>Remove Role</button>
                    <button className="w-1/3 h-full hover:bg-sky-500" onClick={saveChanges}>Save Changes</button>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="grid gap-x-4 grid-cols-10 h-full">
                <div className="col-span-4 h-full bg-white p-4">
                    <h1>Users</h1>
                    <br/>
                    <ul>
                        {sectionData?.map((entry) => (
                            <li key={entry.name} className={"p-2 " + (entry == selectedEntry ? "bg-sky-700" : "hover:bg-sky-500")} 
                            onClick={ () => (
                                setSelectedEntry(entry)
                            )}>
                                <a>{entry.name}</a>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="col-span-6 h-full bg-white p-4">
                    {serveUserReadout()}
                </div>
            </div>
        </>
    )
}