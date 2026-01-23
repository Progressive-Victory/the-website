import type React from 'react'
import type { HTMLAttributes } from 'react'

export function Button({
    children,
    ...props
}: React.PropsWithChildren<HTMLAttributes<HTMLButtonElement>>) {
    return (
        <button
            style={{
                borderRadius: '9999px',
                paddingInline: '0.75rem',
                paddingBlock: '0.25rem',
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#ffffff',

                transitionProperty: 'all',
                transitionDuration: '200ms',
                transitionTimingFunction: 'ease-in-out',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff'
                e.currentTarget.style.color = '#CE3728'
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = '#ffffff'
            }}
            {...props}
        >
            {children}
        </button>
    )
}
