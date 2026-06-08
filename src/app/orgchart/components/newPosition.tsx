import styles from './components.module.css'
import { Handle, Node, NodeProps, Position, XYPosition } from '@xyflow/react'

export enum Banner {
    NONE,
    BLUE,
    RED,
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type PositionNodeData = {
    id: number | string
    title?: string
    name?: string
    banner?: Banner
    bannerTitle?: string
    redacted?: boolean
    bubble?: React.ReactNode
    customData?: unknown[]
}

type PositionNode = Node<PositionNodeData, 'positionNode'>

function PositionNode({
    data,
    sourcePosition,
    targetPosition,
}: NodeProps<PositionNode>) {
    return (
        data.bubble ?? (
            <DefaultPositionNode
                id={data.id.toString()}
                data={{
                    id: data.id,
                    title: data.title,
                    name: data.name,
                    banner: data.banner,
                    bannerTitle: data.bannerTitle,
                    redacted: data.redacted,
                    bubble: null,
                    customData: data.customData,
                }}
                type={'positionNode'}
                dragging={false}
                zIndex={0}
                selectable={false}
                deletable={false}
                selected={false}
                draggable={false}
                isConnectable={false}
                positionAbsoluteX={0}
                positionAbsoluteY={0}
                targetPosition={targetPosition}
                sourcePosition={sourcePosition}
            />
        )
    )
}

function DefaultPositionNode({
    data,
    sourcePosition,
    targetPosition,
}: NodeProps<PositionNode>) {
    return (
        <div key={data.id} className={styles.nodeContainer}>
            <Handle
                type="target"
                position={targetPosition ?? Position.Left}
                className={styles.targetHandle}
            />
            <DefaultPositionBubble data={data} />
            <Handle
                type="source"
                position={sourcePosition ?? Position.Right}
                className={styles.sourceHandle}
            />
        </div>
    )
}

function DefaultPositionBubble({
    data,
    mini,
}: {
    data: PositionNodeData
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
            </div>
        </div>
    )
}

export function CreatePositionNode({
    id,
    title,
    name,
    banner,
    bannerTitle,
    redacted,
    data,
    position,
}: {
    id: number | string
    title?: string
    name?: string
    banner?: Banner
    bannerTitle?: string
    redacted?: boolean
    data?: unknown[]
    position?: XYPosition
}) {
    if (position == null) {
        return {
            id: id.toString(),
            position: { x: 0, y: 0 },
            data: {
                id,
                title,
                name,
                banner,
                bannerTitle,
                redacted,
                data,
            },
        }
    } else
        return {
            id: id.toString(),
            position,
            data: {
                id,
                title,
                name,
                banner,
                bannerTitle,
                redacted,
                data,
            },
        }
}
