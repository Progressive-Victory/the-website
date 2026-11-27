'use client'

import { linePointNodeType } from '../linePointNodes'
import styles from './chartTooltip.module.css'
import {
    pickPlacement,
    type FlowAnchor,
    type FlowPlacement,
} from './flowPlacement'
import { SidebarHeaderButton } from '@/components/common/navigation_stack/sidebar/Sidebar'
import { cn } from '@/util'
import { NodeToolbar, Position, useStore } from '@xyflow/react'
import {
    AnimatePresence,
    motion,
    useMotionValue,
    useReducedMotion,
    useTransform,
    type MotionValue,
} from 'motion/react'
import {
    useLayoutEffect,
    useRef,
    useState,
    type CSSProperties,
    type ReactNode,
    type RefObject,
} from 'react'
import { createPortal } from 'react-dom'
import { FaCheck, FaRegTrashCan, FaXmark } from 'react-icons/fa6'

export interface ChartTooltipAction {
    key: string
    label: string
    icon: ReactNode
    onClick: () => void
    disabled?: boolean
    selected?: boolean
}

export type { FlowAnchor }

interface ChartTooltipProps {
    id: string
    actions: ChartTooltipAction[]
    onDelete: () => void
    at?: FlowAnchor
}

const ease = [0.22, 1, 0.36, 1] as const

const placementOffsets: Record<FlowPlacement, string> = {
    above: 'translate(-50%, calc(-100% - 16px))',
    below: 'translate(-50%, 16px)',
    right: 'translate(16px, -50%)',
    left: 'translate(calc(-100% - 16px), -50%)',
}

const tailStyles: Record<FlowPlacement, string | undefined> = {
    above: undefined,
    below: styles.pointsUp,
    right: styles.pointsLeft,
    left: styles.pointsRight,
}

function useFlowPlacement(at: FlowAnchor | undefined, actionCount: number) {
    const nodeLookup = useStore((state) => state.nodeLookup)
    const ref = useRef<HTMLDivElement>(null)
    const [size, setSize] = useState({ width: 90, height: 40 })
    useLayoutEffect(() => {
        const element = ref.current
        if (!element) return
        setSize({ width: element.offsetWidth, height: element.offsetHeight })
    }, [actionCount])
    if (!at) return { ref, placement: 'above' as const }
    const obstacles = [...nodeLookup.values()].flatMap((node) =>
        node.type === linePointNodeType || node.hidden
            ? []
            : [
                  {
                      ...node.internals.positionAbsolute,
                      width: node.measured.width ?? 0,
                      height: node.measured.height ?? 0,
                  },
              ]
    )
    return {
        ref,
        placement: pickPlacement(at, size, 16, obstacles),
    }
}

function FlowPortal({
    at,
    placement,
    anchorRef,
    children,
}: {
    at: FlowAnchor
    placement: FlowPlacement
    anchorRef: RefObject<HTMLDivElement | null>
    children: ReactNode
}) {
    const [x, y, zoom] = useStore((state) => state.transform)
    const renderer = useStore((state) =>
        state.domNode?.querySelector('.react-flow__renderer')
    )
    if (!renderer) return null
    return createPortal(
        <div
            ref={anchorRef}
            className={cn(styles.flowAnchor, 'nodrag', 'nopan')}
            style={{
                transform: `translate(${x + at.x * zoom}px, ${y + at.y * zoom}px) ${placementOffsets[placement]}`,
            }}
            onClick={(event) => event.stopPropagation()}
            onPointerDown={(event) => event.stopPropagation()}
        >
            {children}
        </div>,
        renderer
    )
}

function FadingAction({
    action,
    edge,
    expansionWidth,
}: {
    action: ChartTooltipAction
    edge: number
    expansionWidth: MotionValue<number>
}) {
    const opacity = useTransform(expansionWidth, [edge - 6, edge], [1, 0])
    return (
        <motion.div style={{ opacity }}>
            <SidebarHeaderButton
                icon={action.icon}
                label={action.label}
                className={cn(
                    styles.button,
                    action.selected && styles.buttonSelected
                )}
                onClick={action.onClick}
                disabled={action.disabled}
            />
        </motion.div>
    )
}

export function ChartTooltip({
    id: nodeId,
    actions,
    onDelete,
    at,
}: ChartTooltipProps) {
    const [confirmingNodeId, setConfirmingNodeId] = useState<string | null>(
        null
    )
    const isConfirming = confirmingNodeId === nodeId
    const toggleLabel = isConfirming ? 'Hide delete confirmation' : 'Delete'
    const reduceMotion = useReducedMotion()
    const trashRef = useRef<HTMLButtonElement>(null)
    const actionsRef = useRef<HTMLDivElement>(null)
    const confirmationRef = useRef<HTMLDivElement>(null)
    const [widths, setWidths] = useState({ trash: 40, confirmation: 40 })
    const [fadeEdges, setFadeEdges] = useState<number[]>([])
    const expansionWidth = useMotionValue(40)
    const { ref: anchorRef, placement } = useFlowPlacement(at, actions.length)

    useLayoutEffect(() => {
        const trash = trashRef.current?.getBoundingClientRect()
        if (!trash) return
        const confirmation =
            confirmationRef.current?.getBoundingClientRect().width
        setWidths({
            trash: trash.width,
            confirmation: confirmation ?? trash.width,
        })
        const icons = actionsRef.current?.querySelectorAll('svg')
        if (icons?.length === actions.length)
            setFadeEdges(
                Array.from(
                    icons,
                    (icon) => trash.right - icon.getBoundingClientRect().right
                )
            )
    }, [isConfirming, nodeId, actions.length])

    const closeConfirmation = () => setConfirmingNodeId(null)

    const content = (
        <div
            className={cn(
                styles.anchor,
                at && placement === 'right' && styles.anchorRight
            )}
            style={{ '--tooltip-actions': actions.length } as CSSProperties}
            onDoubleClickCapture={(event) => event.stopPropagation()}
        >
            <div
                className={cn(styles.tooltip, at && tailStyles[placement])}
                onKeyDown={(event) => {
                    if (event.key === 'Escape') closeConfirmation()
                }}
            >
                <div
                    ref={actionsRef}
                    className={styles.actions}
                    inert={isConfirming}
                    aria-hidden={isConfirming}
                >
                    {actions.map((action, index) => (
                        <FadingAction
                            key={action.key}
                            action={action}
                            edge={
                                fadeEdges[index] ??
                                (actions.length - index) * 40 + 10
                            }
                            expansionWidth={expansionWidth}
                        />
                    ))}
                </div>
                <motion.div
                    className={styles.deleteAction}
                    initial={false}
                    animate={{
                        width: isConfirming
                            ? widths.confirmation + widths.trash
                            : widths.trash,
                    }}
                    transition={{
                        duration: reduceMotion ? 0 : 0.26,
                        ease,
                    }}
                    onUpdate={(latest) => {
                        if (typeof latest.width === 'number')
                            expansionWidth.set(latest.width)
                    }}
                >
                    <div className={styles.confirmationViewport}>
                        <AnimatePresence initial={false}>
                            {isConfirming && (
                                <motion.div
                                    key={nodeId}
                                    ref={confirmationRef}
                                    className={styles.confirmation}
                                    initial={{
                                        x: reduceMotion ? 0 : widths.trash / 2,
                                    }}
                                    animate={{ x: 0 }}
                                    exit={{
                                        x: reduceMotion ? 0 : widths.trash / 2,
                                    }}
                                    transition={{
                                        duration: reduceMotion ? 0 : 0.26,
                                        ease,
                                    }}
                                >
                                    <span>
                                        Are you sure you want to delete this?
                                    </span>
                                    <button
                                        type="button"
                                        aria-label="Confirm Deletion"
                                        title="Confirm Deletion"
                                        className={cn(
                                            styles.answer,
                                            styles.confirmYes
                                        )}
                                        onClick={() => {
                                            closeConfirmation()
                                            onDelete()
                                        }}
                                    >
                                        <FaCheck size={16} aria-hidden="true" />
                                    </button>
                                    <button
                                        type="button"
                                        aria-label="Cancel Deletion"
                                        title="Cancel Deletion"
                                        className={styles.answer}
                                        onClick={closeConfirmation}
                                    >
                                        <FaXmark size={16} aria-hidden="true" />
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <button
                        ref={trashRef}
                        type="button"
                        aria-label={toggleLabel}
                        title={toggleLabel}
                        aria-expanded={isConfirming}
                        className={cn(
                            styles.button,
                            styles.trash,
                            isConfirming && styles.deleteSelected
                        )}
                        onClick={() =>
                            setConfirmingNodeId(isConfirming ? null : nodeId)
                        }
                    >
                        <span className={styles.trashLabel}>
                            <FaRegTrashCan size={20} aria-hidden="true" />
                        </span>
                    </button>
                </motion.div>
            </div>
        </div>
    )

    if (at)
        return (
            <FlowPortal at={at} placement={placement} anchorRef={anchorRef}>
                {content}
            </FlowPortal>
        )
    return (
        <NodeToolbar
            nodeId={nodeId}
            isVisible
            position={Position.Top}
            offset={16}
        >
            {content}
        </NodeToolbar>
    )
}
