import styles from './components.module.css'
import { PositionData, PositionBubble } from './position'
import { Handle, Node, NodeProps, Position } from '@xyflow/react'
import { motion } from 'motion/react'
import React, { useState } from 'react'

export interface DepartmentData {
    id: number
    name: string
    leads?: PositionData[]
    members?: PositionData[]
}

export type DepartmentNodeData = Node<{
    id: number
    name: string
    leads?: PositionData[]
    members?: PositionData[]
}>

export function DepartmentNode({
    data,
    sourcePosition,
    targetPosition,
}: NodeProps<DepartmentNodeData>) {
    const [contentEnabled, setContentEnabled] = useState(false)

    const DepartmentLeads = () => {
        return data.leads?.map(RenderLead)
        function RenderLead(lead: PositionData) {
            return <PositionBubble key={lead.id} data={lead} />
        }
    }

    const handlePointerEnter = (e: React.PointerEvent) => {
        if (e.pointerType == 'mouse') {
            setContentEnabled(true)
        }
    }

    return (
        <div
            key={data.id}
            className={styles.container}
            onPointerEnter={handlePointerEnter}
            onPointerLeave={() => setContentEnabled(false)}
        >
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
                    maxHeight: `${contentEnabled ? '240' : '0'}px`,
                }}
                animate={{
                    maxHeight: `${contentEnabled ? '240' : '0'}px`,
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

export function DepartmentBubble({ name }: { name: string }) {
    return (
        <div className={styles.yellowBubble}>
            <p>{name.toUpperCase()}</p>
        </div>
    )
}
