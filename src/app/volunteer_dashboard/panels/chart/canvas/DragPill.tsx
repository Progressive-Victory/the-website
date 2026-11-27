'use client'

import styles from '../page.module.css'
import { GroupDragContext } from './GroupDragContext'
import type { GroupDragFeedback } from './useGroupDrag'
import { useContext, type CSSProperties } from 'react'
import { FiMinus, FiPlus } from 'react-icons/fi'

const RING_RADIUS = 6
const RING_LENGTH = 2 * Math.PI * RING_RADIUS

interface DragMessage {
    kind: 'join' | 'leave' | 'pull'
    text: string
}

function dragMessage(
    { sourceGroupId, targetGroupId, progress, popped }: GroupDragFeedback,
    nameOf: (id: string) => string
): DragMessage | undefined {
    if (targetGroupId !== sourceGroupId)
        return targetGroupId
            ? { kind: 'join', text: `Add to ${nameOf(targetGroupId)}` }
            : {
                  kind: 'leave',
                  text: `Remove from ${nameOf(sourceGroupId ?? '')}`,
              }
    if (sourceGroupId && !popped && progress > 0)
        return {
            kind: 'pull',
            text: `Keep dragging to leave ${nameOf(sourceGroupId)}`,
        }
    return undefined
}

function ProgressRing({ progress }: { progress: number }) {
    return (
        <svg className={styles.dragRing} viewBox="0 0 16 16" aria-hidden="true">
            <circle cx="8" cy="8" r={RING_RADIUS} />
            <circle
                cx="8"
                cy="8"
                r={RING_RADIUS}
                strokeDasharray={RING_LENGTH}
                strokeDashoffset={RING_LENGTH * (1 - progress)}
            />
        </svg>
    )
}

export function DragPill({ id }: { id: string }) {
    const { feedback, nameOf } = useContext(GroupDragContext)
    if (feedback?.nodeId !== id) return null
    const message = dragMessage(feedback, nameOf)
    if (!message) return null
    return (
        <div
            key={message.kind}
            className={styles.dragPill}
            data-kind={message.kind}
            role="status"
        >
            {message.kind === 'pull' ? (
                <ProgressRing progress={feedback.progress} />
            ) : (
                <span className={styles.dragPillIcon} aria-hidden="true">
                    {message.kind === 'join' ? <FiPlus /> : <FiMinus />}
                </span>
            )}
            <span>{message.text}</span>
        </div>
    )
}

export function useDragAttributes(id: string, dragging: boolean | undefined) {
    const { feedback } = useContext(GroupDragContext)
    const own = feedback?.nodeId === id ? feedback : undefined
    const regrouping =
        !!feedback && feedback.targetGroupId !== feedback.sourceGroupId
    const release =
        feedback?.sourceGroupId === id
            ? feedback.popped
                ? Number(feedback.targetGroupId !== id)
                : feedback.progress
            : 0
    return {
        'data-dragging': Boolean(dragging),
        'data-popped': Boolean(own?.pop),
        'data-drop-target': regrouping && feedback.targetGroupId === id,
        'data-releasing': release > 0,
        style: {
            '--pop-x': `${own?.pop?.x ?? 0}px`,
            '--pop-y': `${own?.pop?.y ?? 0}px`,
            '--release-progress': release,
        } as CSSProperties,
    }
}
