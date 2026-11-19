import type { ReactElement, SVGProps } from 'react'

// Custom Icon made due to dissatisfaction with icons from common libraries.
export function CloseCircleIcon(props: SVGProps<SVGSVGElement>): ReactElement {
    return (
        <svg viewBox="0 0 16 16" aria-hidden="true" {...props}>
            <circle cx="8" cy="8" r="8" />
            <path d="M5.5 5.5l5 5m0-5l-5 5" />
        </svg>
    )
}
