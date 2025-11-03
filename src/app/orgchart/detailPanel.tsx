import { Panel } from '@xyflow/react'
import PositionBubble from './bubbles/positionBubble'
import Position from './types/positionData'

export default function DetailPanel({
    name,
    desc,
    leads,
    members,
}: {
    name?: string
    desc?: string
    leads?: Position[]
    members?: Position[]
}) {
    const MemberList = () => {
        if (leads && members) {
            return leads.concat(members).map(CreateMini)
        } else if (leads) {
            return leads.map(CreateMini)
        } else if (members) {
            return members.map(CreateMini)
        } else return null
        function CreateMini(position: Position) {
            return (
                <PositionBubble key={position.id} data={position} mini={true} />
            )
        }
    }

    return (
        <Panel
            className={`${name ? null : 'hidden'} h-[96%] w-[320px] rounded-3xl border-4 border-amber-300 bg-amber-50 p-2 font-extrabold`}
            position="center-right"
        >
            <p className="text-xl text-black-pearl-dark">{name}</p>
            {!desc ? null : (
                <div className="overflow-y-auto border-t-4 border-red-600">
                    <p className="py-1 text-sm font-semibold text-black-pearl-dark">
                        {desc}
                    </p>
                </div>
            )}
            {!leads && !members ? null : (
                <div className="flex flex-col items-center overflow-auto border-t-4 border-red-600 py-1">
                    <MemberList />
                </div>
            )}
            {/*<div>
                List of admin buttons; this won't be needed in the MVP
            </div>*/}
        </Panel>
    )
}
