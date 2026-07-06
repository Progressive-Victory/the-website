import { BaseEdge, Edge, EdgeProps, getBezierPath } from '@xyflow/react'

type CustomEdge = Edge<{ value: number }, 'custom-edge'>

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
        <BaseEdge
            id={id}
            path={edgePath}
            style={{ stroke: '#1b4568', strokeWidth: 3 }}
        />
    )
}

export function CreateEdge({
    source,
    target,
    id = `e${source.toString()}-${target.toString()}`,
}: {
    source: string | number
    target: string | number
    id?: string | number
}) {
    return {
        id: id.toString(),
        source: source.toString(),
        target: target.toString(),
        type: 'custom-edge',
    }
}
