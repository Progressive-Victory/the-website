import { HTMLAttributes } from 'react'

export function Button({
    children,
    className,
    ...props
}: React.PropsWithChildren<HTMLAttributes<HTMLButtonElement>>) {
    return (
        <button
            className={`rounded-full px-3 py-1 text-xl font-bold text-white transition duration-200 ease-in-out hover:bg-white hover:text-valencia ${className ?? ''}`}
            {...props}
        >
            {children}
        </button>
    )
}
