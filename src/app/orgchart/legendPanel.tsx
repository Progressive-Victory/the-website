import { Panel } from '@xyflow/react'
import { useState } from 'react'

export default function LegendPanel() {
    const [opened, setOpened] = useState(false)

    const Legend = () => {
        return (
            <div className="mb-2 rounded-xl border-2 border-amber-300 bg-amber-50 p-2">
                Sample Content
            </div>
        )
    }

    return (
        <Panel position="top-left">
            {opened ? <Legend /> : null}
            <button
                onClick={() => setOpened(!opened)}
                className="rounded-xl border-2 border-amber-300 bg-amber-50 p-2 text-xs font-semibold text-black-pearl-dark"
            >
                Toggle Legend
            </button>
        </Panel>
    )
}
