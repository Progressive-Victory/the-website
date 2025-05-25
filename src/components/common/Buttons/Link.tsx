import NextLink, { LinkProps } from "next/link";

interface ButtonLinkProps extends LinkProps {
  href: string;
  className?: string;
}

export default function Link({
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
      className={`flex justify-center items-center text-xl font-bold px-4 py-2 text-white text-center hover:text-valencia hover:bg-white rounded-full transition duration-200 ease-in-out ${className ? className : ""}`}
      {...linkProps}
    >
      {children}
    </NextLink>
  )
}