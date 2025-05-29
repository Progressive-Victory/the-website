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
            <div className="relative flex size-full flex-col bg-steel-blue">
                <div className="halftone z-2 absolute left-0 top-0 size-full py-20 opacity-10" />

                <div className="z-1 grid flex-1 grid-cols-12 items-stretch gap-x-4 overflow-hidden opacity-90">
                    <div className="col-span-2 overflow-y-auto bg-white p-4">
                        <h1 className="text-lg font-semibold text-black-pearl-dark">Admin Portal</h1>
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

                    <div className="col-span-10 overflow-y-auto p-4">
                        {serveSectionComp()}
                    </div>
                </div>
            </div>
        </MainLayout>
    )
}