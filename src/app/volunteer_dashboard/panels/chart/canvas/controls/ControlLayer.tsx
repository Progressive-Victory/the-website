'use client'

import styles from './controlLayer.module.css'
import { cn } from '@/util'
import { Panel, type PanelPosition } from '@xyflow/react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

export function ControlLayer({
    position,
    children,
}: {
    position: PanelPosition
    children: ReactNode
}) {
    return (
        <Panel position={position} className={styles.layer}>
            {children}
        </Panel>
    )
}

export function ControlGroup({
    className,
    children,
}: {
    className?: string
    children: ReactNode
}) {
    return <div className={cn(styles.group, className)}>{children}</div>
}

export function ControlButton({
    className,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...props}
            type="button"
            className={cn(styles.button, className)}
        />
    )
}
