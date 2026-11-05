import { useId, type ReactElement, type SVGProps } from 'react'

interface ClonePlusIconProps extends SVGProps<SVGSVGElement> {
    size?: number | string
}

export function ClonePlusIcon({
    size = 20,
    ...props
}: ClonePlusIconProps): ReactElement {
    const clipId = useId()

    return (
        <svg
            viewBox="0 0 512 512"
            width={size}
            height={size}
            fill="none"
            stroke="currentColor"
            strokeWidth={40}
            strokeLinejoin="round"
            aria-hidden="true"
            {...props}
        >
            <clipPath id={clipId}>
                <path
                    clipRule="evenodd"
                    d="M0 0h512v512H0z M180 -8h248a92 92 0 0 1 92 92v248a92 92 0 0 1-92 92H180a92 92 0 0 1-92-92V84a92 92 0 0 1 92-92z"
                />
            </clipPath>
            <rect
                x="24"
                y="120"
                width="368"
                height="368"
                rx="60"
                clipPath={`url(#${clipId})`}
            />
            <rect x="120" y="24" width="368" height="368" rx="60" />
            <path strokeLinecap="round" d="M304 122v172M218 208h172" />
        </svg>
    )
}
