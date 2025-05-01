'use client'
import { useState, useEffect } from "react"
import { IUser } from "@/models/User"
import { IRole } from "@/models/Role"

export function UsersDash() {
    // Contains a list of users to be displayed in the middle panel
    const [sectionData, setSectionData] = useState<IUser[]>()
    // Contains which of the users is currently selected
    const [selectedEntry, setSelectedEntry] = useState<IUser>()
    // Contains a list of existing for use in a drop down for adding roles that has yet to be implemented
    const [roleList, setRoleList] = useState<IRole[]>()

    // use effect hook for pulling database entries for roleList and sectionData on component load
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

    // This is a helper function that checks if an object is an array.
    // It's honestly just here to make the line its on more readable.
    function isIterable(obj: object): boolean {
        return Array.isArray(obj)
    }

    // Helper function that takes in a generic type, an array of said generic type,
    // and a string representing the key for the desired field to return as a string
    // in the stead of this object
    function iterableToString<T>(arr: Array<T>, printField: string): string[] {
        const printKey = printField as keyof T
        return arr.map((value) => ((value[printKey] as object).toString()))
    }

    // This function is a callback for the "Add Role" button.
    // It accepts a string that should correspond to the name field of the desired role.
    // Said string is used to grab the the role object with the corresponding name field
    // from "roleList" and apply it to the "roles" field of the currently selected user.
    // Currently the corresponding button has a single string hard coded into it because
    // it needs to be replaced by a dropdown or something in that vein that populates with
    // the "roleList" array. Unfortunately I seriously lack the front end dev knowledge to 
    // implment that in a remotely timely manner and I know there are people on the team
    // that could do this faster so I'm passing this bit off. (sorry emily)
    const addRole = (roleStr: string) => {
        const tgtRole = roleList?.find(x => x.name == roleStr)
        if(!tgtRole) throw Error("Cannot add role. Tgt role is undefined.") //throw error if no corresponding role could be found.
        if(!selectedEntry?.roles.includes(tgtRole)) selectedEntry?.roles.push(tgtRole) //if the role doesnt already exist on that user, add it to the roles field
    }

    // This is a callback function that is identical to the "addRole()" function except it
    // removes a role instead of adding it. Its button also needs to be changed into a dropdown.
    const removeRole = (roleStr: string) => {
        if(!selectedEntry) return //cancel operation if no user is selected
        const index = selectedEntry.roles.findIndex(x => x.name == roleStr) //find the index of the role matching the target string
        if(index > -1) selectedEntry.roles.splice(index, 1) //if the index search found something, remove it
    }

    // callback for submitting changes made to all user objects to the database to save.
    const saveChanges = async () => {
        await fetch('/api/admin/user', {method: "PATCH", body: JSON.stringify(sectionData)})
    }

    // this function renders the right hand panel with the information of the selectedEntry (user)
    // it should trigger everytime the selectedEntry is changed. For some reason I can't get it 
    // to update when the roles within the selectedEntry are changed though.
    function serveUserReadout() {
        if(!selectedEntry) return // if there is no selectedEntry then abort function
        type userkey = keyof IUser // this is for some reason required if I'm going to reference an object's fields by string. For some reason I think the declaration only works on a separate line.
        const props = Object.keys(selectedEntry) // get list of selectedEntry Fields
        return (
            <div className="overflow-scroll">
                <table className="w-auto">
                    {props.map((key) => (
                        <tr key={key}>
                            <th className="p-1 border border-black">{key}</th>
                            <td className="break-all p-1 border border-black">{isIterable(selectedEntry[key as userkey]) ? iterableToString<IRole>(selectedEntry[key as userkey], 'name') : selectedEntry[key as userkey].toString()}</td>
                        </tr>
                    ))}
                </table>
            </div>
        )
    }

    // serve overall layout
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