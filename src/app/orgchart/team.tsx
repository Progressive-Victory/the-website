'use client'
import { useState } from 'react'

export default function TeamBubble({
    name,
    description,
    members,
}: {
    name: string
    description?: string
    members?: string[]
}) {
    const [opened, setOpened] = useState(false)

    function handleClick() {
        if (!opened) {
            setOpened(true)
        } else setOpened(false)
        console.log('I was clicked!')
    }

    function ClickPrompt() {
        function PromptDisplay() {
            if (!opened)
                return (
                    <p className="pt-1 text-xs font-semibold text-red-600">
                        {'['}CLICK FOR MORE{']'}
                    </p>
                )
            else
                return (
                    <p className="pt-1 text-xs font-semibold text-red-600">
                        {'['}CLICK FOR LESS{']'}
                    </p>
                )
        }
        if (description == null && members == null) return null
        return (
            <div>
                <div className="border-2 border-red-600"></div>
                {PromptDisplay()}
            </div>
        )
    }

    function DescriptionBox() {
        if (description == null || !opened) return null
        return (
            <div>
                <p className="py-1 text-xs font-semibold text-black-pearl-dark">
                    {description.toUpperCase()}
                </p>
            </div>
        )
    }

    function MemberList() {
        if (members == null || !opened) return null
        return <ul className="list-disc pl-5">{members.map(MemberPoint)}</ul>
    }

    function MemberPoint(member: string) {
        return (
            <li key={member} className="font-black">
                {member.toUpperCase()}
            </li>
        )
    }

    return (
        <div
            className="m-4 w-64 rounded-r-2xl border-4 border-amber-300 bg-amber-50 p-4 text-black-pearl-dark"
            onClick={handleClick}
        >
            <p className="text-lg font-extrabold">{name.toUpperCase()}</p>
            {ClickPrompt()}
            {DescriptionBox()}
            {MemberList()}
        </div>
    )
}
