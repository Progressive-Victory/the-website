import { BaseEdge, Edge, EdgeProps, getBezierPath } from '@xyflow/react'

type CustomEdge = Edge<{ value: number }, 'custom'>

export default function OrgChartEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
}: EdgeProps<CustomEdge>) {
    const [edgePath] = getBezierPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
    })
    return (
        <>
            <BaseEdge
                className="stroke-black-pearl-light stroke-2"
                id={id}
                path={edgePath}
            />
        </>
    )
}
