import { ReactNode } from 'react'

type HFlexAlignment = 'center' | 'top' | 'bottom'

export interface HStackProps {
    align?: HFlexAlignment
    gap?: boolean | number
    grow?: boolean | number
    className?: string
    children: ReactNode
}

export function HStack({
    align = 'center',
    gap = 0,
    grow = 0,
    className,
    children,
}: HStackProps) {
    const gapStyle = `${Number(gap)}rem`
    const flexGrow = Number(grow)
    const alignItems =
        align === 'top' ? 'start' : align === 'bottom' ? 'end' : 'center'

    return (
        <div
            style={{
                display: 'flex',
                gap: gapStyle,
                flexGrow,
                alignItems,
            }}
            className={className}
        >
            {children}
        </div>
    )
}
