import Committee from './committee'
import styles from './components.module.css'
import { Handle, Node, NodeProps, Position, XYPosition } from '@xyflow/react'
import Image from 'next/image'

export interface PositionData {
    id: number
    title?: string
    name?: string
    acting?: boolean
    redacted?: boolean
    leadership?: string
    committees?: Committee[]
}

type PositionNodeData = Node<{
    id: number
    title: string
    name?: string
    acting?: boolean
    redacted?: boolean
    leadership?: string
    committees?: Committee[]
}>

export function PositionNode({
    data,
    targetPosition,
    sourcePosition,
}: NodeProps<PositionNodeData>) {
    const properties: PositionData = {
        id: data.id,
        title: data.title,
        name: data.name,
        acting: data.acting,
        redacted: data.redacted,
        leadership: data.leadership,
        committees: data.committees,
    }

    return (
        <div key={data.id} className={styles.nodeContainer}>
            <Handle
                type="target"
                position={targetPosition ?? Position.Left}
                className={styles.targetHandle}
            />
            <PositionBubble data={properties} />
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
    const LeadershipBanner = () => {
        switch (data.leadership) {
            case 'Junior':
                return (
                    <div
                        className={styles.juniorBanner}
                        title="Junior Leadership"
                    />
                )
            case 'Senior':
                return (
                    <div
                        className={styles.seniorBanner}
                        title="Senior Leadership"
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
                    CANDIDATE REDACTED
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
        if (data.acting) {
            return (
                <p
                    style={{
                        fontSize: `${mini ? '0.875' : '1'}rem`,
                        lineHeight: `${mini ? '1.25' : '1.5'}rem`,
                        color: '#ffffff',
                    }}
                >
                    {data.name.toUpperCase()}
                    <span style={{ color: '#dc2626' }}>
                        {' ('}ACTING{')'}
                    </span>
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

    const Committees = () => {
        return (
            <div className={styles.committeesContainer}>
                {data.committees?.map((committee) => {
                    return (
                        <div
                            key={committee.name}
                            className={styles.committeeIcon}
                            style={{ height: `${mini ? '17' : '20'}px` }}
                        >
                            <Image
                                src={committee.icon}
                                alt={committee.alt}
                                width={mini ? 17 : 20}
                                height={mini ? 17 : 20}
                                title={committee.name}
                            />
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
            <LeadershipBanner />
            <div
                style={{
                    gridColumn: `${data.committees ? 'span 10 / span 10' : 'span 11 / span 11'}`,
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
                        ? data.title?.toUpperCase()
                        : 'VOLUNTEER'}
                </p>
                <Nameplate />
            </div>
            {data.committees ? <Committees /> : null}
        </div>
    )
}

const defaultPos: XYPosition = { x: 0, y: 0 }

export function CreatePositionNode({
    id,
    title,
    name,
    acting,
    redacted,
    leadership,
    committees,
}: {
    id: number
    title: string
    name?: string
    acting?: boolean
    redacted?: boolean
    leadership?: string
    committees?: Committee[]
}) {
    return {
        id: id.toString(),
        type: 'pos',
        position: defaultPos,
        data: {
            id,
            title,
            name,
            acting,
            redacted,
            leadership,
            committees,
        },
    }
}
