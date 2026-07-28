import { type MouseEventHandler, ReactNode } from 'react'

type HFlexAlignment = 'middle' | 'top' | 'bottom'

export interface HStackProps {
    align?: HFlexAlignment
    gap?: boolean | number
    grow?: boolean | number
    className?: string
    children: ReactNode
    onClick?: MouseEventHandler<HTMLDivElement>
}

export function HStack({
    align = 'middle',
    gap = 0,
    grow = 0,
    className,
    children,
    onClick,
}: HStackProps) {
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
