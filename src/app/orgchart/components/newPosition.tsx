import styles from './components.module.css'
import Tag from './tag'
import { Handle, Node, NodeProps, Position, XYPosition } from '@xyflow/react'

export enum Banner {
    NONE,
    BLUE,
    RED,
}

type RGB = `rgb(${number}, ${number}, ${number})`
type RGBA = `rgba(${number}, ${number}, ${number}, ${number})`
type HSL = `hsl(${number}, ${number}, ${number})`
type HSLA = `hsla(${number},${number},${number})`
type HEX = `#${string}`
type Color = RGB | RGBA | HSL | HSLA | HEX

export interface BannerObject {
    color?: Color
    title?: string
}

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
    const Banner = () => {
        switch (data.banner) {
            case 1:
                return (
                    <div
                        className={styles.juniorBanner}
                        title={data.bannerTitle}
                    />
                )
            case 2:
                return (
                    <div
                        className={styles.seniorBanner}
                        title={data.bannerTitle}
                    />
                )
            default:
                return (
                    <div
                        className={styles.banner}
                        style={{ borderRightWidth: 0 }}
                    />
                )
        }
    }

    const Nameplate = () => {
        if (data.redacted) {
            return (
                <p
                    style={{
                        fontSize: `${mini ? '0.875' : '1'}rem`,
                        lineHeight: `${mini ? '1.25' : '1.5'}rem`,
                        color: '#dc2626',
                    }}
                >
                    REDACTED
                </p>
            )
        }
        if (data.name == null) {
            return (
                <p
                    style={{
                        fontSize: `${mini ? '0.875' : '1'}rem`,
                        lineHeight: `${mini ? '1.25' : '1.5'}rem`,
                        color: '#dc2626',
                    }}
                >
                    UNFILLED
                </p>
            )
        }
        return (
            <p
                style={{
                    fontSize: `${mini ? '0.875' : '1'}rem`,
                    lineHeight: `${mini ? '1.25' : '1.5'}rem`,
                    color: '#ffffff',
                }}
            >
                {data.name.toUpperCase()}
            </p>
        )
    }

    const Tags = () => {
        return (
            <div className={styles.tagContainer}>
                {data.tags?.map((tag) => {
                    return (
                        <div
                            key={tag.name}
                            className={styles.tag}
                            title={tag.tooltip}
                        >
                            {tag.graphic}
                        </div>
                    )
                })}
            </div>
        )
    }

    return (
        <div
            className={styles.pearlBubble}
            style={{ width: `${mini ? '290' : '360'}px` }}
        >
            <Banner />
            <div
                style={{
                    gridColumn: 'span 11 / span 11',
                    padding: '0.5rem',
                }}
            >
                <p
                    className={styles.title}
                    style={{
                        fontSize: `${mini ? '0.75' : '0.875'}rem`,
                        lineHeight: `${mini ? '1' : '1.25'}rem`,
                    }}
                >
                    {data.title != null
                        ? data.title.toUpperCase()
                        : 'VOLUNTEER'}
                </p>
                <Nameplate />
                <Tags />
            </div>
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
}: {
    id: number | string
    position?: XYPosition
    title?: string
    name?: string
    banner?: Banner
    bannerTitle?: string
    redacted?: boolean
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
        },
    }
}
