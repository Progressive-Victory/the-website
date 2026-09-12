import type { ReactElement, SVGProps } from 'react'

interface SidebarIconProps extends SVGProps<SVGSVGElement> {
    size?: number
}

export function SidebarIcon({
    size = 22,
    ...props
}: SidebarIconProps): ReactElement {
    return (
        // Custom Sidebar Icon made due to dissatisfaction with sidebar icons from common libraries.
        <svg
            fill="none"
            height={size}
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            viewBox="0 0 24 24"
            width={size}
            {...props}
        >
            <rect height="18" rx="3" width="20" x="2" y="3" />
            <line x1="9" x2="9" y1="3" y2="21" />
            <line x1="4.5" x2="7" y1="7.5" y2="7.5" />
            <line x1="4.5" x2="7" y1="11" y2="11" />
            <line x1="4.5" x2="7" y1="14.5" y2="14.5" />
        </svg>
    )
}
