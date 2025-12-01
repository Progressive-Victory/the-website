import { HTMLAttributes } from 'react'

export function Button({
    children,
    ...props
}: React.PropsWithChildren<HTMLAttributes<HTMLButtonElement>>) {
    return (
        <button
            {...props}
            style={{
                borderRadius: '9999px',
                paddingInline: '0.75rem',
                paddingBlock: '0.25rem',
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'white',
                backgroundColor: 'transparent',
                transition: 'all 0.2s ease-in-out',
                cursor: 'pointer',
                border: 'none',
                ...props.style,
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'white'
                e.currentTarget.style.color = '#CE3728'
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = 'white'
            }}
        >
            {children}
        </button>
    )
}
