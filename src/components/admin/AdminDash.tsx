'use client'

import { useState } from "react"
import { MainLayout } from "../MainLayout"
import { DashPages, DashPermissions, DashRoles} from "../admin"
import DetailRow from "./DetailRow"
import DashBrowser from "./DashBrowser"

export default function AdminDash() {
    enum Section {
        Members,
        Roles,
        Permissions,
        Pages
    }

    const sectionArray = Object.values(Section).filter((value) => (
        isNaN(Number(value))
    ))

    const [section, setSection] = useState<number>(Section.Members)

    function serveSectionComp() {
        switch (section) {
            case Section.Pages:
                return <DashPages />
            case Section.Permissions:
                return <DashPermissions />
            case Section.Roles:
                return <DashRoles />
            case Section.Members:
                return (
                    <DashBrowser apiStr="/api/admin/user" title="User" displayKey="name">
                        <DetailRow label="Discord Username" tgtKey="name" />
                        <DetailRow label="Nickname" tgtKey="preferredName" />
                        <DetailRow label="Email" tgtKey="email" />
                        <DetailRow label="Discord ID" tgtKey="discordId" />
                        <DetailRow label="Address Line 1" tgtKey="addr" doDiv={false} />
                        <DetailRow label="Address Line 2" tgtKey="addr" doDiv={false} />
                        <DetailRow label="City" tgtKey="city" doDiv={false} />
                        <DetailRow label="County" tgtKey="county" doDiv={false} />
                        <DetailRow label="State" tgtKey="state" doDiv={false} />
                        <DetailRow label="Zip Code" tgtKey="zipCode" />
                        {/* still need to figure out how tf to do roles */}
                    </DashBrowser>
                )
        }
    }

    return (
        <MainLayout>
            <div className="relative flex flex-col bg-steel-blue w-full h-full">
                <div className="absolute top-0 left-0 w-full h-full halftone opacity-10 z-2 py-20" />

                <div className="items-stretch z-1 grid grid-cols-12 gap-x-4 opacity-90 flex-1 overflow-hidden">
                    <div className="col-span-2 bg-white p-4 overflow-y-auto">
                        <h1 className="text-black-pearl-dark text-lg font-semibold">Admin Portal</h1>
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