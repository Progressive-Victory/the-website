'use client'

import { NavItem } from './types'
import styles from '@/app/styles/components/header.module.css'
import { ModularButton } from '@/components/common/ButtonComponent'
import { AnimatePresence, motion } from 'motion/react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import NextLink from 'next/link'
import type React from 'react'
import { useEffect, useState } from 'react'

const navitems: NavItem[] = [
    { name: 'About', href: '/about' },
    { name: 'Volunteer', href: '/volunteer' },
    { name: 'Events', href: '/events' },
    { name: 'Endorsements', href: '/endorsements' },
    { name: 'Merch', href: 'https://progressivevictory.myshopify.com/' },
    {
        name: 'Contact',
        href: 'https://docs.google.com/forms/d/e/1FAIpQLSdBRKV6bbxcx6HtNALWyjAwvEXbGSIG9s7iFEFlCEImVXILHA/viewform',
    },
]

export function Header() {
    const [isOpen, setIsOpen] = useState(false)
    const { data: session } = useSession()
    const avatarSrc = session?.user?.image ?? ''

    useEffect(() => {
        if (!isOpen) return

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false)
        }

        document.addEventListener('keydown', onKeyDown)
        const prevOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'

        return () => {
            document.removeEventListener('keydown', onKeyDown)
            document.body.style.overflow = prevOverflow
        }
    }, [isOpen])

    return (
        <>
            <header className={styles.headerRoot}>
                <div className={styles.headerLogoSmall}>
                    <NextLink href="/" className={styles.logoLink}>
                        <Image
                            src="/images/Logo_White.svg"
                            alt="progressive-victory-logo"
                            width={62.25}
                            height={78}
                        />
                    </NextLink>
                </div>

                <div className={styles.headerLogoLarge}>
                    <NextLink href="/" className={styles.logoLink}>
                        <Image
                            src="/images/LogoFull.webp"
                            alt="progressive-victory-logo"
                            width={256}
                            height={78}
                        />
                    </NextLink>
                </div>

                <nav
                    className={styles.headerCenterNav}
                    aria-label="Primary navigation"
                >
                    {navitems.map(({ name, href }) => (
                        <ModularButton
                            key={name}
                            label={name}
                            buttonType="nav"
                            href={href}
                        />
                    ))}
                </nav>

                <div className={styles.headerRightActions}>
                    <ModularButton label="Donate" buttonType="donate" />

                    {!session ? (
                        <ModularButton
                            label="Log In"
                            buttonType="login"
                            href="/login"
                        />
                    ) : (
                        <ModularButton
                            label="Account"
                            buttonType="account"
                            href="/account"
                            avatarSrc={avatarSrc}
                            avatarAlt="User avatar"
                        />
                    )}
                </div>

                <motion.button
                    type="button"
                    className={styles.headerMenuButton}
                    onClick={() => setIsOpen((prev) => !prev)}
                    initial={false}
                    animate={isOpen ? 'open' : 'closed'}
                    whileHover="hover"
                    whileTap="tap"
                    variants={menuButtonVariants}
                    transition={{ type: 'spring', stiffness: 520, damping: 32 }}
                    aria-label={
                        isOpen
                            ? 'Close navigation menu'
                            : 'Open navigation menu'
                    }
                    aria-expanded={isOpen}
                    aria-controls="site-nav-drawer"
                >
                    <HamburgerIcon isOpen={isOpen} />
                </motion.button>
            </header>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        key="nav-backdrop"
                        aria-hidden="true"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className={styles.navBackdrop}
                        onClick={() => setIsOpen(false)}
                    />
                )}
            </AnimatePresence>

            <NavDrawer isOpen={isOpen}>
                {navitems
                    .map(({ href, name }) => (
                        <ModularButton
                            key={name}
                            label={name}
                            buttonType="nav"
                            href={href}
                            buttonVariant="long"
                        />
                    ))
                    .concat(
                        <ModularButton
                            key="donate-mobile"
                            label="Donate"
                            buttonType="donate"
                            buttonVariant="long"
                        />
                    )
                    .concat(
                        !session ? (
                            <ModularButton
                                label="Log In"
                                buttonType="login"
                                buttonVariant="long"
                                href="/login"
                                key="login-mobile"
                            />
                        ) : (
                            <ModularButton
                                label="Account"
                                buttonType="account"
                                buttonVariant="long"
                                href="/account"
                                avatarSrc={avatarSrc}
                                avatarAlt="User avatar"
                                key="account-mobile"
                            />
                        )
                    )}
            </NavDrawer>
        </>
    )
}

const menuButtonVariants = {
    closed: {
        scale: 1,
        color: '#FFFFFF',
    },
    open: {
        scale: 1,
        color: '#FFFFFF',
    },
    hover: {
        scale: 1.07,
        color: '#CE3728',
    },
    tap: {
        scale: 0.94,
    },
} as const

function HamburgerIcon({ isOpen }: { isOpen: boolean }) {
    return (
        <motion.span
            className={styles.headerMenuIconWrapper}
            aria-hidden="true"
            initial={false}
            animate={isOpen ? 'open' : 'closed'}
        >
            <motion.span
                variants={hamburgerLineVariantsTop}
                className={styles.headerMenuIconLine}
            />
            <motion.span
                variants={hamburgerLineVariantsMiddle}
                className={styles.headerMenuIconLine}
            />
            <motion.span
                variants={hamburgerLineVariantsBottom}
                className={styles.headerMenuIconLine}
            />
        </motion.span>
    )
}

const hamburgerLineVariantsTop = {
    closed: { y: -7 as const, rotate: 0 as const, opacity: 1 as const },
    open: { y: 0 as const, rotate: 45 as const, opacity: 1 as const },
} as const

const hamburgerLineVariantsMiddle = {
    closed: { y: 0 as const, opacity: 1 as const, scaleX: 1 as const },
    open: { y: 0 as const, opacity: 0 as const, scaleX: 0.6 as const },
} as const

const hamburgerLineVariantsBottom = {
    closed: { y: 7 as const, rotate: 0 as const, opacity: 1 as const },
    open: { y: 0 as const, rotate: -45 as const, opacity: 1 as const },
} as const

const containerVariants = {
    hidden: {
        y: '-100%',
        transition: {
            type: 'tween',
            ease: 'easeInOut',
            duration: 0.2,
        },
    },
    visible: {
        y: '-2%',
        transition: {
            ease: 'easeInOut',
            type: 'spring',
            stiffness: 250,
            damping: 25,
            staggerChildren: 0.05,
        },
    },
}

const itemVariants = {
    hidden: {
        y: -14,
        scale: 0.985,
    },
    visible: {
        y: 0,
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
        transition: {
            ease: 'easeInOut',
            type: 'spring',
            stiffness: 300,
            damping: 5,
            mass: 0.55,
        },
    },
    exit: {
        y: -8,
        opacity: 0,
        scale: 0.99,
        filter: 'blur(6px)',
        transition: {
            duration: 0.16,
            ease: [0.4, 0, 0.2, 1],
        },
    },
}

function NavDrawer(props: { isOpen: boolean; children: React.ReactNode[] }) {
    const { isOpen, children } = props
    const shouldRender = isOpen

    return (
        <AnimatePresence>
            {shouldRender && (
                <motion.nav
                    key="nav-drawer"
                    id="site-nav-drawer"
                    aria-label="Mobile navigation"
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={containerVariants}
                    className={styles.navDrawer}
                >
                    <div className={styles.navDrawerInner}>
                        {children.map((child, i) => (
                            <motion.div
                                key={i}
                                variants={itemVariants}
                                animate="visible"
                                exit="exit"
                                className={styles.navDrawerItem}
                            >
                                {child}
                            </motion.div>
                        ))}
                    </div>
                </motion.nav>
            )}
        </AnimatePresence>
    )
}