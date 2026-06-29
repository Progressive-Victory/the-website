import { ReactNode } from 'react'

type VFlexAlignment = 'center' | 'left' | 'right'

export interface VStackProps {
    align?: VFlexAlignment
    gap?: boolean | number
    grow?: boolean | number
    className?: string
    children: ReactNode
}

export function VStack({
    align = 'center',
    gap = 0,
    grow = 0,
    className,
    children,
}: VStackProps) {
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
        >
            {children}
        </div>
    )
}
