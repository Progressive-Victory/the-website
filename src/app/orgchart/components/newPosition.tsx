import styles from './components.module.css'
import Tag from './tag'
import { Handle, Node, NodeProps, Position, XYPosition } from '@xyflow/react'
import { motion } from 'motion/react'
import { useCallback, useRef, useState } from 'react'

export enum Banner {
    NONE,
    BLUE,
    RED,
}

type RGB = `rgb(${number}, ${number}, ${number})`
type RGBA = `rgba(${number}, ${number}, ${number}, ${number})`
type HSL = `hsl(${number}, ${number}, ${number})`
type HSLA = `hsla(${number},${number}%,${number}%,${number})`
type HEX = `#${string}`
type Color = RGB | RGBA | HSL | HSLA | HEX

export interface BannerObject {
    color?: Color
    title?: string
}

export const DefaultBanners: BannerObject[] = [
    { color: '#60a5fa', title: 'Junior' },
    { color: '#dc2626', title: 'Senior' },
]

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type PositionData = {
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
        <div className={styles.nodeContainer}>
            <Handle
                type="target"
                position={targetPosition ?? Position.Left}
                className={styles.targetHandle}
            />
            <PositionBubble data={data} />
            <Handle
                type="source"
                position={sourcePosition ?? Position.Right}
                className={styles.sourceHandle}
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
    const bubble = useRef<HTMLDivElement>(null)
    const titleRef = useRef<HTMLDivElement>(null)
    const [textboxWidth, setBoxWidth] = useState<number>(310)

    const Banner = () => {
        switch (data.banner) {
            case 1:
                return (
                    <div
                        className={styles.banner}
                        style={{ backgroundColor: '#60a5fa' }}
                        title={data.bannerTitle}
                    />
                )
            case 2:
                return (
                    <div
                        className={styles.banner}
                        style={{ backgroundColor: '#dc2626' }}
                        title={data.bannerTitle}
                    />
                )
            default:
                return (
                    <div
                        className={styles.banner}
                        style={{ display: 'none' }}
                    />
                )
        }
    }

    // Should take 1 second to scroll 50 pixels.

    const Titleplate = useCallback(() => {
        return (
            <motion.div
                initial={{
                    translateX: 0,
                }}
                animate={{
                    translateX: [
                        0,
                        `min(calc(-100% + ${textboxWidth}px), 0px)`,
                    ],
                    transition: {
                        delay: 0.2,
                        times: [0.2, 0.8],
                        duration: 10,
                        repeat: Infinity,
                    },
                }}
            >
                {data.title != null ? data.title.toUpperCase() : 'VOLUNTEER'}
            </motion.div>
        )
    }, [data, textboxWidth])

    const Nameplate = useCallback(() => {
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
                initial={{
                    translateX: 0,
                }}
                animate={{
                    translateX: [
                        0,
                        `min(calc(-100% + ${textboxWidth}px), 0px)`,
                    ],
                    transition: {
                        delay: 0.2,
                        times: [0.2, 0.8],
                        duration: 10,
                        repeat: Infinity,
                    },
                }}
                onAnimationStart={() => {
                    setBoxWidth(
                        titleRef.current ? titleRef.current.offsetWidth : 310
                    )
                }}
            >
                {newName}
            </motion.div>
        )
    }, [data, textboxWidth])

    const Tags = useCallback(() => {
        if (!data.tags) return
        const pairs: Tag[][] = []
        data.tags.forEach((tag: Tag, index: number) => {
            if (index % 2 == 0) {
                pairs.push([tag])
            } else pairs[Math.floor(index / 2)][1] = tag
        })
        return (
            <div className={styles.tags}>
                {pairs.map((pair) => {
                    return (
                        <div className={styles.tagContainer} key={pair[0].name}>
                            {pair.map((tag) => {
                                return (
                                    <div
                                        key={tag.name}
                                        className={styles.tag}
                                        title={tag.tooltip ?? tag.name}
                                    >
                                        {tag.graphic}
                                    </div>
                                )
                            })}
                        </div>
                    )
                })}
            </div>
        )
    }, [data])

    return (
        <div
            className={styles.pearlBubble}
            style={{ width: `${mini ? '290' : '360'}px` }}
            onClick={() => {
                console.log(bubble.current?.offsetHeight)
            }}
        >
            <Banner />
            <div className={styles.textbox}>
                <div className={styles.titleContainer} ref={titleRef}>
                    <Titleplate />
                </div>
                <div className={styles.nameplateContainer}>
                    <Nameplate />
                </div>
            </div>
            <Tags />
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
            title,
            name,
            banner,
            bannerTitle,
            redacted,
            tags,
        },
    }
}
