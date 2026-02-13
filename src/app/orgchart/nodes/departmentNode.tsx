import DepartmentBubble from '../bubbles/departmentBubble'
import PositionBubble from '../bubbles/positionBubble'
import PositionData from '../types/positionData'
import styles from './nodes.module.css'
import { Handle, Node, NodeProps, Position, useStore } from '@xyflow/react'
import { motion } from 'motion/react'

export type DepartmentNodeData = Node<{
    id: number
    name: string
    leads?: PositionData[]
    members?: PositionData[]
}>

const zoomSelector = (s: { transform: number[] }) => s.transform[2] >= 1.1

export default function DepartmentNode({
    data,
    sourcePosition,
    targetPosition,
}: NodeProps<DepartmentNodeData>) {
    const extraContent = useStore(zoomSelector)

    const DepartmentLeads = () => {
        return data.leads?.map(RenderLead)
        function RenderLead(lead: PositionData) {
            return <PositionBubble key={lead.id} data={lead} />
        }
    }

    return (
        <div key={data.id} className={styles.container}>
            <Handle
                type="target"
                position={targetPosition ?? Position.Left}
                className={styles.targetHandle}
            />
            <DepartmentBubble name={data.name}></DepartmentBubble>
            <motion.div
                className={styles.dropdownContainer}
                style={{
                    willChange: 'max-height',
                }}
                initial={{
                    maxHeight: `${extraContent ? '240' : '0'}px`,
                }}
                animate={{
                    maxHeight: `${extraContent ? '240' : '0'}px`,
                    transition: {
                        type: 'tween',
                        duration: 0.5,
                    },
                }}
            >
                <DepartmentLeads />
            </motion.div>
            <Handle
                type="source"
                position={sourcePosition ?? Position.Right}
                className={styles.sourceHandle}
            />
        </div>
    )
}
