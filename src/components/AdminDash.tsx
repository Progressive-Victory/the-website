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
                    <div className="col-span-10 h-full p-4">
                        {serveSectionComp()}
                    </div>
                </div>
            </div>
        </MainLayout>
    )
}