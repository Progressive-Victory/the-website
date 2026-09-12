import styles from './components.module.css'
import { Handle, NodeProps, Position, XYPosition } from '@xyflow/react'

export function BlankNode({ targetPosition, sourcePosition }: NodeProps) {
    return (
        <div className={styles.nodeContainer}>
            <Handle
                type="target"
                position={targetPosition ?? Position.Left}
                className={styles.handle}
            />
            <div className={styles.blankNode} />
            <Handle
                type="source"
                position={sourcePosition ?? Position.Right}
                className={styles.handle}
            />
        </div>
    )
}

export function createBlankNode({
    id,
    position = { x: 0, y: 0 },
}: {
    id: string | number
    position?: XYPosition
}) {
    return {
        id: id.toString(),
        type: 'blankNode',
        position,
        data: {},
    }
}
