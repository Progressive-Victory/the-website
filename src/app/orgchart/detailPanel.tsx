import { Panel } from '@xyflow/react'

export default function DetailPanel({
    name,
    desc,
}: {
    name: string
    desc?: string
}) {
    return (
        <Panel
            className="m-4 w-[320px] rounded-3xl border-4 border-amber-300 bg-amber-50 p-2 font-extrabold"
            position="center-right"
        >
            <p className="text-xl text-black-pearl-dark">{name}</p>
            <div className="overflow-y-auto border-t-4 border-red-600">
                <p className="py-1 text-sm font-semibold text-black-pearl-dark">
                    {desc}
                </p>
            </div>
            <div>{/*List of generic members*/}</div>
            <div>
                {/*List of admin buttons; this won't be needed in the MVP*/}
            </div>
        </Panel>
    )
}
