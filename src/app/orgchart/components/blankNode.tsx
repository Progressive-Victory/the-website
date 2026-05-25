import styles from './components.module.css'
import { Handle, NodeProps, Position } from '@xyflow/react'

export function BlankNode({ targetPosition, sourcePosition }: NodeProps) {
    return (
        <div className={styles.nodeContainer}>
            <Handle
                type="target"
                position={targetPosition ?? Position.Left}
                className={styles.targetHandle}
            />
            <Handle
                type="source"
                position={sourcePosition ?? Position.Right}
                className={styles.sourceHandle}
            />
        </div>
    )
}
