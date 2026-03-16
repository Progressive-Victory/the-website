import styles from './HoverTooltip.module.css'
import { CSSProperties, ReactNode } from 'react'

export interface HoverTooltipProps {
    content: string
    children: ReactNode
    className?: string
    tooltipClassName?: string
    triggerStyle?: CSSProperties
    focusable?: boolean
}

export function HoverTooltip({
    content,
    children,
    className,
    tooltipClassName,
    triggerStyle,
    focusable = false,
}: HoverTooltipProps) {
    return (
        <span
            className={[styles.trigger, className].filter(Boolean).join(' ')}
            style={triggerStyle}
            tabIndex={focusable ? 0 : undefined}
        >
            {children}
            <span className={[styles.tooltip, tooltipClassName].filter(Boolean).join(' ')}>
                {content}
            </span>
        </span>
    )
}
