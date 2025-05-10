'use client'
import { useState } from "react"
import { MainLayout } from "./MainLayout"
import { UsersDash } from "./UsersDash"
import { RolesDash } from "./RolesDash"
import { PermissionsDash } from "./PermissionsDash"
import { PagesDash } from "./PagesDash"

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

    function serveSectionComp() {
        switch(section) {
            case Section.Users:
                return <UsersDash/>
            case Section.Roles:
                return <RolesDash/>
            case Section.Permissions:
                return <PermissionsDash/>
            case Section.Pages:
                return <PagesDash/>
        }
    }

    return (
        <MainLayout>
            <div className="relative flex flex-col bg-steel-blue w-full h-full">
                <div className="absolute top-0 left-0 w-full h-full halftone opacity-10 z-2 py-20"/>
    
                <div className="items-stretch z-1 grid grid-cols-12 gap-x-4 opacity-90 flex-1 overflow-hidden">
                    <div className="col-span-2 bg-white p-4 overflow-y-auto">
                        <h1>Admin Portal</h1>
                        <br/>
                        <ul>
                            {sectionArray.map((value, index) => (
                                <li key={value} className={"p-2 " + (value == Section[section] ? "bg-sky-700" : "hover:bg-sky-500")}
                                 onClick={() => (
                                    setSection(index)
                                )} >
                                    <a className="cursor-pointer">{value}</a>
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    <div className="col-span-10 p-4 overflow-y-auto">
                        {serveSectionComp()}
                    </div>
                </div>
            </div>
        </MainLayout>
    )
}