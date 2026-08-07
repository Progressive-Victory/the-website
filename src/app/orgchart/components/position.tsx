import { Banner, PositionBanner } from './banner'
import styles from './components.module.css'
import { Tag, Tags } from './tag'
import { Handle, Node, NodeProps, Position, XYPosition } from '@xyflow/react'
import { motion } from 'motion/react'
import { useRef } from 'react'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type PositionData = {
    id: string | number
    title?: string
    name?: string
    banner?: Banner
    bannerTitle?: string
    redacted?: boolean
    tags?: Tag[]
}

export type PositionNode = Node<PositionData, 'positionNode'>

export function PositionNode({
    data,
    sourcePosition,
    targetPosition,
}: NodeProps<PositionNode>) {
    return (
        <div className={styles.nodeContainer} key={data.id}>
            <Handle
                type="target"
                position={targetPosition ?? Position.Left}
                className={styles.targetHandle}
                style={{ opacity: 0 }}
            />
            <PositionBubble data={data} />
            <Handle
                type="source"
                position={sourcePosition ?? Position.Right}
                className={styles.sourceHandle}
                style={{ opacity: 0 }}
            />
        </div>
    )
}

export function PositionBubble({
    data,
    mini,
}: {
    data: PositionData
    mini?: boolean
}) {
    const titleRef = useRef<HTMLDivElement>(null)

    return (
        <div
            className={styles.pearlBubble}
            style={{ width: `${mini ? '290' : '360'}px` }}
        >
            <PositionBanner data={data} />
            <div className={styles.textbox}>
                <div className={styles.titleContainer} ref={titleRef}>
                    <Titleplate data={data} />
                </div>
                <div className={styles.nameplateContainer}>
                    <Nameplate data={data} />
                </div>
            </div>
            <Tags data={data} />
        </div>
    )
}

export function CreatePositionNode({
    id,
    position = { x: 0, y: 0 },
    title,
    name,
    banner,
    bannerTitle,
    redacted,
    tags,
}: {
    id: number | string
    position?: XYPosition
    title?: string
    name?: string
    banner?: Banner
    bannerTitle?: string
    redacted?: boolean
    tags?: Tag[]
}) {
    return {
        id: id.toString(),
        type: 'positionNode',
        position,
        data: {
            id: id.toString(),
            title,
            name,
            banner,
            bannerTitle,
            redacted,
            tags,
        },
    }
}

const Titleplate = ({ data }: { data: PositionData }) => {
    return (
        <motion.div
            initial={{
                translateX: 0,
            }}
        >
            {data.title != null ? data.title.toUpperCase() : 'VOLUNTEER'}
        </motion.div>
    )
}

const Nameplate = ({ data }: { data: PositionData }) => {
    let newName: string
    if (data.redacted) {
        newName = 'REDACTED'
    } else if (data.name == null) {
        newName = 'UNFILLED'
    } else newName = data.name.toUpperCase()
    return (
        <motion.div
            style={{
                color: `${newName == 'REDACTED' || newName == 'UNFILLED' ? '#dc2626' : '#ffffff'}`,
            }}
        >
            {newName}
        </motion.div>
    )
}
