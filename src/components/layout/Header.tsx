'use client'

import { NavItem } from './types'
import { ModularButton } from '@/components/common/ButtonComponent'
import styles from '@/components/layout/header.module.css'
import { AnimatePresence, motion } from 'motion/react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import NextLink from 'next/link'
import type React from 'react'
import { useEffect, useState } from 'react'

/**
 * A navigation header for the Progressive Victory website.
 *
 * This component renders a sticky header bar with the Progressive Victory
 * logo on the left and a navigation menu on the right. The navigation menu
 * includes links to the main pages of the website, as well as a "Donate" button.
 * On large screens, the menu is shown as a horizontal list of links. On small
 * screens, the menu is hidden and replaced with a hamburger menu icon that
 * toggles the display of the menu when clicked. When the menu is displayed on
 * small screens, it is rendered as a vertical list of links that covers the
 * entire screen.
 *
 */

const navitems: NavItem[] = [
    {
        name: 'About',
        href: '/about',
        children: [
            { name: 'Mission', href: '/about' },
            { name: 'Community', href: '/about' },
            { name: 'Creators', href: '/about' },
            { name: 'Staff', href: '/about' },
            { name: 'Halls Of Victory', href: '/about' },
        ],
    },
    {
        name: 'Join',
        href: '/volunteer',
        children: [
            { name: 'Initatives', href: '/volunteer' },
            { name: 'State Organizing Program', href: '/volunteer' },
            { name: 'Community', href: '/volunteer' },
        ],
    },
    {
        name: 'Events',
        href: '/events',
        children: [
            { name: 'Calender', href: '/events' },
            { name: 'Meet Ups', href: '/events' },
            { name: 'Phonebanking/Canvassing', href: '/events' },
            { name: 'Gaming', href: '/events' },
        ],
    },
    {
        name: 'Endorsements',
        href: '/endorsements',
        children: [
            { name: '2022', href: '/about' },
            { name: '2023', href: '/about' },
            { name: '2024', href: '/about' },
            { name: '2025', href: '/about' },
            { name: '2026', href: '/about' },
            { name: 'Halls Of Victory', href: '/about' },
        ],
    },
    {
        name: 'More...',
        href: '/home',
        children: [
            {
                name: 'Contact',
                href: 'https://docs.google.com/forms/d/e/1FAIpQLSdBRKV6bbxcx6HtNALWyjAwvEXbGSIG9s7iFEFlCEImVXILHA/viewform',
            },
            {
                name: 'Merch',
                href: 'https://progressivevictory.myshopify.com/',
            },
            {
                name: 'Join',
                href: '/volunteer',
            },
        ],
    },
]

export function Header() {
    const [isOpen, setIsOpen] = useState(false)

    const [activeSubnav, setActiveSubnav] = useState<NavItem | null>(null)
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

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setActiveSubnav(null)
        }
        document.addEventListener('keydown', onKeyDown)
        return () => document.removeEventListener('keydown', onKeyDown)
    }, [])

    const openSubnav = (item: NavItem) => {
        if (!item.children || item.children.length === 0) {
            setActiveSubnav(null)
            return
        }

        if (typeof window !== 'undefined' && window.innerWidth < 1280) return

        setActiveSubnav(item)
    }

    const closeSubnav = () => setActiveSubnav(null)

    return (
        <>
            <header
                className={styles.headerRoot}
                style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 60,
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    gap: '14px',
                    backgroundColor: 'rgba(9, 34, 58, 0.98)',
                    color: '#FFFFFF',
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                }}
            >
                <div className={styles.headerLogoSmall}>
                    <NextLink href="/">
                        <Image
                            src="/images/Logo_White.svg"
                            alt="progressive-victory-logo"
                            width={62.25}
                            height={78}
                        />
                    </NextLink>
                </div>

                <div className={styles.headerLogoLarge}>
                    <NextLink href="/">
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
                    {navitems.map((item) => {
                        const hasChildren = !!item.children?.length
                        const isActive = activeSubnav?.name === item.name
                        const shouldDim = !!activeSubnav && !isActive

                        const wrapperClassName = [
                            styles.desktopNavItemWrapper,
                            isActive ? styles.navItemActive : '',
                            shouldDim ? styles.navItemDimmed : '',
                        ]
                            .filter(Boolean)
                            .join(' ')

                        return (
                            <div
                                key={item.name}
                                className={wrapperClassName}
                                onMouseEnter={() => openSubnav(item)}
                                onFocus={() => openSubnav(item)}
                            >
                                <ModularButton
                                    label={item.name}
                                    buttonType="nav"
                                    href={item.href}
                                />

                                {hasChildren ? (
                                    <span className={styles.srOnly}>
                                        {isActive
                                            ? 'Submenu expanded'
                                            : 'Has submenu'}
                                    </span>
                                ) : null}
                            </div>
                        )
                    })}
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
                {activeSubnav?.children?.length ? (
                    <motion.div
                        key="desktop-subnav"
                        className={styles.desktopSubnavRoot}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.16, ease: 'easeOut' }}
                        onMouseLeave={closeSubnav}
                    >
                        <div className={styles.desktopSubnavInner}>
                            {activeSubnav.children.map((child) => (
                                <ModularButton
                                    key={child.name}
                                    label={child.name}
                                    buttonType="nav"
                                    href={child.href}
                                />
                            ))}
                        </div>
                    </motion.div>
                ) : null}
            </AnimatePresence>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        key="nav-backdrop"
                        aria-hidden="true"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            zIndex: 30,
                            backdropFilter: 'blur(10px)',
                            WebkitBackdropFilter: 'blur(10px)',
                            backgroundColor: 'rgba(0, 0, 0, 0.18)',
                        }}
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
            style={{
                display: 'inline-flex',
                width: '1.75rem',
                height: '1.75rem',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
            }}
        >
            <motion.span
                variants={hamburgerLineVariantsTop}
                className={styles.headerMenuIcon}
                style={hamburgerLineBaseStyle}
            />
            <motion.span
                variants={hamburgerLineVariantsMiddle}
                className={styles.headerMenuIcon}
                style={hamburgerLineBaseStyle}
            />
            <motion.span
                variants={hamburgerLineVariantsBottom}
                className={styles.headerMenuIcon}
                style={hamburgerLineBaseStyle}
            />
        </motion.span>
    )
}

const hamburgerLineBaseStyle: React.CSSProperties = {
    position: 'absolute',
    width: '1.75rem',
    height: '0.18rem',
    borderRadius: '999px',
    background: 'currentColor',
    transformOrigin: 'center',
}

const hamburgerLineVariantsTop = {
    closed: { y: -7, rotate: 0, opacity: 1 },
    open: { y: 0, rotate: 45, opacity: 1 },
} as const

const hamburgerLineVariantsMiddle = {
    closed: { y: 0, opacity: 1, scaleX: 1 },
    open: { y: 0, opacity: 0, scaleX: 0.6 },
} as const

const hamburgerLineVariantsBottom = {
    closed: { y: 7, rotate: 0, opacity: 1 },
    open: { y: 0, rotate: -45, opacity: 1 },
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
                    style={{
                        position: 'fixed',
                        zIndex: 50,
                        paddingTop: '32px',
                        backgroundColor: 'rgba(9, 34, 58, 0.88)',
                        borderBottom: '1px solid rgba(255,255,255,0.10)',
                    }}
                >
                    {children.map((child, i) => (
                        <motion.div
                            key={i}
                            variants={itemVariants}
                            animate="visible"
                            exit="exit"
                        >
                            {child}
                        </motion.div>
                    ))}
                </motion.nav>
            )}
        </AnimatePresence>
    )
}
