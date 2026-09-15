import { type MouseEventHandler, ReactNode } from 'react'

type GridRowAlignment = 'center' | 'top' | 'bottom'

export interface GridRowProps {
    align?: GridRowAlignment
    gap?: boolean | number
    grow?: boolean | number
    className?: string
    children: ReactNode
    onClick?: MouseEventHandler<HTMLDivElement>
}

export function GridRow({
    align = 'center',
    gap = 0,
    grow = 0,
    className,
    children,
    onClick,
}: GridRowProps) {
    const gapStyle = `${Number(gap)}rem`
    const flexGrow = Number(grow)
    const alignItems =
        align === 'top' ? 'start' : align === 'bottom' ? 'end' : 'center'

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'row',
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
