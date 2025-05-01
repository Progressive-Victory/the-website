'use client'
import { useState, useEffect } from "react"
import { IUser } from "@/models/User"
import { IRole} from "@/models/Role"

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
    function isIterable(obj:any): boolean {
        return Array.isArray(obj)
    }

    // This is a temp function that returns the name field of roles. 
    // If I were using an oop approach in a language I knew better this wouldn't exist and 
    // the object I wanted to list a name would have an overridden toString() function but I 
    // have no idea how to do that with typescript interfaces. As it stands, this function will 
    // cause errors in the future under certain conditions listed below and needs to be replaced 
    // by a better solution.
    function iterableToString(obj:Array<any>): string[] {
        // This will cause crashes if the user interface gets other arrays that contain docs without a name property in the future!!!
        return obj.map((value: any) => (value["name"]))
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

    
    const saveChanges = async () => {
        if (sectionData) console.log(JSON.stringify(sectionData))
        await fetch('/api/admin/user', {method: "PATCH", body: JSON.stringify(sectionData)})
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