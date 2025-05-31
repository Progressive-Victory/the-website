import NextLink, { LinkProps } from 'next/link'

interface ButtonLinkProps extends LinkProps {
    href: string
    className?: string
}

export function Link({
    href,
    className,
    children,
    ...linkProps
}: React.PropsWithChildren<ButtonLinkProps>) {
    return (
        <NextLink
            href={href}
            target={href.includes('https') ? '_blank' : ''}
            referrerPolicy={'no-referrer'}
            className={`flex items-center justify-center rounded-full px-4 py-2 text-center text-xl font-bold text-white transition duration-200 ease-in-out hover:bg-white hover:text-valencia ${className ? className : ''}`}
            {...linkProps}
        >
            {children}
        </NextLink>
    )
}
