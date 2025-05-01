'use client'
import { useState, useEffect } from "react"
import { IUser } from "@/models/User"
import { IRole} from "@/models/Role"
import { HydratedDocument } from "mongoose"

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
            const response = await fetch("/api/admin/role")
            const data = await response.json()
            setRoleList(data)
        }
        getRoleList()
        getSectionData()
    }, [])

    function isIterable(obj:any): boolean {
        return Array.isArray(obj)
    }

    function iterableToString(obj:Array<any>): string[] {
        console.log
        //this will cause crashes if the user interface gets other arrays that contain docs without a name property in the future!!!
        return obj.map((value: any) => (value["name"]))
    }

    const addRole = (roleStr: string) => {
        console.log("Adding Role")
        const tgtRole = roleList?.filter(x => x.name == roleStr)[0]
        if(!tgtRole) throw Error("Cannot add role. Tgt role is undefined.")
        if(!selectedEntry?.roles.includes(tgtRole)) selectedEntry?.roles.push(tgtRole)
        console.log(selectedEntry)
    }

    const removeRole = (roleStr: string) => {
        console.log("Removing Role")
        if(!selectedEntry) return
        const index = selectedEntry.roles.findIndex(x => x.name == roleStr)
        selectedEntry.roles.splice(index, 1)
        console.log(selectedEntry)
    }

    const saveChanges = async () => {
        console.log("Saving Changes")
        await 
    }

    function serveUserReadout() {
        console.log(selectedEntry)
        if(!selectedEntry) return
        type userkey = keyof IUser
        const props = Object.keys(selectedEntry)
        return (
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
                    <div className="flex h-full grid">
                        {serveUserReadout()}
                        <div className="block self-end h-20 w-full">
                            <button className="w-1/3 h-full hover:bg-sky-500" onClick={() => (addRole("Superadmin"))}>Add Role</button>
                            <button className="w-1/3 h-full hover:bg-sky-500" onClick={() => (removeRole("Superadmin"))}>Remove Role</button>
                            <button className="w-1/3 h-full hover:bg-sky-500" onClick={saveChanges}>Save Changes</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}