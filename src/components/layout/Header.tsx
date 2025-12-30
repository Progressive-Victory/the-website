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
