export interface SpacerProps {
    grow?: number
    className?: string
}

export function Spacer({ grow = 1, className }: SpacerProps) {
    return <div style={{ flexGrow: grow }} className={className}></div>
}
