import { type MouseEventHandler, ReactNode } from 'react'

type VFlexAlignment = 'center' | 'left' | 'right'

export interface GridColumnProps {
    align?: VFlexAlignment
    gap?: boolean | number
    grow?: boolean | number
    className?: string
    children: ReactNode
    onClick?: MouseEventHandler<HTMLDivElement>
}

export function GridColumn({
    align = 'center',
    gap = 0,
    grow = 0,
    className,
    children,
    onClick,
}: GridColumnProps) {
    const gapStyle = `${Number(gap)}rem`
    const flexGrow = Number(grow)
    const alignItems =
        align === 'left' ? 'start' : align === 'right' ? 'end' : 'center'

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: gapStyle,
                flexGrow,
                alignItems,
            }}
            className={className}
            onClick={onClick}
        >
            {children}
        </div>
    )
}
