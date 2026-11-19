import { Children, type MouseEventHandler, ReactNode } from 'react'

type ZStackAlignment =
    | 'center'
    | 'topLeft'
    | 'top'
    | 'topRight'
    | 'left'
    | 'right'
    | 'bottomLeft'
    | 'bottom'
    | 'bottomRight'

export interface ZStackProps {
    align?: ZStackAlignment
    gap?: boolean | number
    grow?: boolean | number
    className?: string
    children: ReactNode
    onClick?: MouseEventHandler<HTMLDivElement>
}

const alignmentMap: Record<
    ZStackAlignment,
    { justifyItems: string; alignItems: string }
> = {
    topLeft: { justifyItems: 'start', alignItems: 'start' },
    top: { justifyItems: 'center', alignItems: 'start' },
    topRight: { justifyItems: 'end', alignItems: 'start' },
    left: { justifyItems: 'start', alignItems: 'center' },
    center: { justifyItems: 'center', alignItems: 'center' },
    right: { justifyItems: 'end', alignItems: 'center' },
    bottomLeft: { justifyItems: 'start', alignItems: 'end' },
    bottom: { justifyItems: 'center', alignItems: 'end' },
    bottomRight: { justifyItems: 'end', alignItems: 'end' },
}

export function ZStack({
    align = 'center',
    gap = 0,
    grow = 0,
    className,
    children,
    onClick,
}: ZStackProps) {
    const gapStyle = `${Number(gap)}rem`
    const flexGrow = Number(grow)
    const { justifyItems, alignItems } = alignmentMap[align]

    return (
        <div
            style={{
                display: 'grid',
                gridTemplate: '1fr / 1fr',
                gap: gapStyle,
                flexGrow,
                justifyItems,
                alignItems,
            }}
            className={className}
            onClick={onClick}
        >
            {Children.map(children, (child, index) => (
                <div style={{ gridArea: '1 / 1', zIndex: index }}>{child}</div>
            ))}
        </div>
    )
}
