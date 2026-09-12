import { BannerColor, PositionBanner } from './banner'
import styles from './components.module.css'
import { Tag, Tags } from './tag'
import { cn } from '@/util'
import { Handle, Node, NodeProps, Position, XYPosition } from '@xyflow/react'
import { motion } from 'motion/react'
import { useRef } from 'react'

// TODO - Resolve the line below
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type PositionData = {
    id: string | number
    title?: string
    name?: string
    bannerColor?: BannerColor
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
        <div className={styles.nodeContainer}>
            <Handle
                type="target"
                position={targetPosition ?? Position.Left}
                className={styles.handle}
            />
            <PositionBubble data={data} />
            <Handle
                type="source"
                position={sourcePosition ?? Position.Right}
                className={styles.handle}
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
            className={cn(
                styles.pearlBubble,
                mini ? styles.bubbleSmall : styles.bubbleLarge
            )}
        >
            <PositionBanner data={data} />
            <div className={styles.textbox}>
                <div className={styles.titleContainer} ref={titleRef}>
                    {renderTitleplate({ data })}
                </div>
                <div className={styles.nameplateContainer}>
                    {renderNameplate({ data })}
                </div>
            </div>
            <Tags data={data} />
        </div>
    )
}

export function createPositionNode({
    id,
    position = { x: 0, y: 0 },
    title,
    name,
    bannerColor,
    bannerTitle,
    redacted,
    tags,
}: {
    id: number | string
    position?: XYPosition
    title?: string
    name?: string
    bannerColor?: BannerColor
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
            bannerColor,
            bannerTitle,
            redacted,
            tags,
        },
    }
}

const renderTitleplate = ({ data }: { data: PositionData }) => {
    return (
        <motion.div
            initial={{
                translateX: 0,
            }}
        >
            {data?.title?.toUpperCase() ?? 'VOLUNTEER'}
        </motion.div>
    )
}

const renderNameplate = ({ data }: { data: PositionData }) => {
    const newName = data.redacted
        ? 'REDACTED'
        : (data.name?.toUpperCase() ?? 'UNFILLED')
    return (
        <motion.div
            className={
                newName === 'REDACTED' || newName == 'UNFILLED'
                    ? styles.positionNameplateRed
                    : styles.positionNameplateWhite
            }
        >
            {newName}
        </motion.div>
    )
}
