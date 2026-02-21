'use client'

import { NavItem } from './types'
import { BaseButton } from '@/components/common/buttons/Button'
import buttonStyles from '@/components/common/buttons/Button.module.css'
import { AccountButton } from '@/components/common/buttons/button_types/AccountButton'
import { DonateButton } from '@/components/common/buttons/button_types/DonateButton'
import { LoginButton } from '@/components/common/buttons/button_types/LoginButton'
import { NavButton } from '@/components/common/buttons/button_types/NavButton'
import { SubNavButton } from '@/components/common/buttons/button_types/SubNavButton'
import styles from '@/components/layout/header.module.css'
import { TokenClaims } from '@/contracts/data'
import { useAuth } from '@/util/hooks'
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
 */

const navitems: NavItem[] = [
    {
        name: 'About',
        href: '/about',
        subnav: {
            columns: [
                {
                    title: 'Learn',
                    items: [
                        { name: 'Mission', href: '/about' },
                        { name: 'Community', href: '/about' },
                    ],
                },
            ],
        },
    },
    {
        name: 'Volunteer',
        href: '/volunteer',
        subnav: {
            columns: [
                {
                    title: 'Get involved',
                    items: [{ name: 'Join', href: '/volunteer' }],
                },
            ],
        },
    },
    {
        name: 'Events',
        href: '/events',
        subnav: {
            columns: [
                {
                    title: 'Browse',
                    items: [
                        { name: 'Calendar', href: '/events' },
                        {
                            name: 'Mobilize',
                            href: 'https://www.mobilize.us/progressivevictory/',
                        },
                    ],
                },
            ],
        },
    },
    {
        name: 'Endorsements',
        href: '/endorsements',
        subnav: {
            columns: [
                {
                    title: 'Endorsements',
                    items: [
                        { name: 'View Endorsements', href: '/endorsements' },
                    ],
                },
            ],
        },
    },
    {
        name: 'More',
        href: '/home',
        subnav: {
            columns: [
                {
                    title: 'Join',
                    items: [
                        { name: 'Volunteer', href: '/volunteer' },
                        {
                            name: 'Contact',
                            href: 'https://docs.google.com/forms/d/e/1FAIpQLSdBRKV6bbxcx6HtNALWyjAwvEXbGSIG9s7iFEFlCEImVXILHA/viewform',
                        },
                    ],
                },
                {
                    title: 'Support PV',
                    items: [
                        {
                            name: 'Dues Paying Membership',
                            href: 'https://secure.actblue.com/donate/pvmember',
                        },
                        {
                            name: 'Merch',
                            href: 'https://progressivevictory.myshopify.com/',
                        },
                    ],
                },
            ],
        },
    },
]

const PANEL_TRANSITION = {
    type: 'tween',
    duration: 0.18,
    ease: [0.22, 1, 0.36, 1],
} as const

const menuButtonVariants = {
    closed: { scale: 1, color: '#FFFFFF' },
    open: { scale: 1, color: '#FFFFFF' },
    hover: { scale: 1.07, color: '#CE3728' },
    tap: { scale: 0.94 },
} as const

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

const itemVariants = {
    hidden: { y: -14, scale: 0.985 },
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
        transition: { duration: 0.16, ease: [0.4, 0, 0.2, 1] },
    },
} as const

const drawerTransition = {
    type: 'tween',
    duration: 0.2,
    ease: [0.4, 0, 0.2, 1],
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

function MobileBackButton(props: { onClick: () => void }) {
    return (
        <button
            type="button"
            className={styles.mobileBackButton}
            onClick={props.onClick}
            aria-label="Back to main menu"
        >
            <span className={styles.mobileBackIcon} aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                        d="M15 18l-6-6 6-6"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </span>
            <span className={styles.mobileBackText}>Back</span>
        </button>
    )
}

interface NavDrawerProps {
    isOpen: boolean
    navitems: NavItem[]
    mobileSubnavItem: NavItem | null
    setMobileSubnavItem: (item: NavItem | null) => void
    session: TokenClaims | null
    avatarSrc: string
    onLogin: () => Promise<void>
}

function NavDrawer({
    isOpen,
    navitems,
    mobileSubnavItem,
    setMobileSubnavItem,
    session,
    avatarSrc,
    onLogin,
}: NavDrawerProps) {
    const showSubnav = mobileSubnavItem !== null

    return (
        <AnimatePresence>
            {isOpen ? (
                <motion.nav
                    key="nav-drawer"
                    id="site-nav-drawer"
                    aria-label="Mobile navigation"
                    initial={{ y: '-100%' }}
                    animate={{ y: '-2%' }}
                    exit={{ y: '-100%' }}
                    transition={drawerTransition}
                    className={styles.navDrawer}
                    style={{
                        position: 'fixed',
                        zIndex: 50,
                        paddingTop: '32px',
                        backgroundColor: 'rgba(9, 34, 58, 0.88)',
                        borderBottom: '1px solid rgba(255,255,255,0.10)',
                        overflow: 'hidden',
                    }}
                >
                    <div style={{ position: 'relative' }}>
                        <AnimatePresence mode="wait" initial={false}>
                            {!showSubnav ? (
                                <motion.div
                                    key="mobile-panel-main"
                                    className={styles.mobilePanel}
                                    initial={{ x: '8%', opacity: 0 }}
                                    animate={{ x: '0%', opacity: 1 }}
                                    exit={{ x: '-8%', opacity: 0 }}
                                    transition={PANEL_TRANSITION}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            rowGap: '1rem',
                                        }}
                                    >
                                        {navitems.map((item) => {
                                            const hasChildren =
                                                !!item.subnav?.columns?.length

                                            return (
                                                <motion.div
                                                    key={item.name}
                                                    variants={itemVariants}
                                                    animate="visible"
                                                    exit="exit"
                                                >
                                                    <BaseButton
                                                        label={item.name}
                                                        className={
                                                            buttonStyles.plain
                                                        }
                                                        buttonVariant="long"
                                                        showChevron={
                                                            hasChildren
                                                        }
                                                        rotateChevronOnHover={
                                                            false
                                                        }
                                                        href={item.href}
                                                        renderContent={({
                                                            showNavChevron,
                                                        }) => (
                                                            <span
                                                                className={
                                                                    buttonStyles.buttonContent
                                                                }
                                                            >
                                                                <span
                                                                    className={
                                                                        buttonStyles.buttonLabel
                                                                    }
                                                                >
                                                                    {item.name}
                                                                </span>

                                                                {showNavChevron ? (
                                                                    <span
                                                                        className={
                                                                            buttonStyles.embeddedChevron
                                                                        }
                                                                        role="button"
                                                                        tabIndex={
                                                                            0
                                                                        }
                                                                        aria-label={`Open ${item.name} submenu`}
                                                                        onPointerDown={(
                                                                            e
                                                                        ) => {
                                                                            e.preventDefault()
                                                                            e.stopPropagation()
                                                                        }}
                                                                        onClick={(
                                                                            e
                                                                        ) => {
                                                                            e.preventDefault()
                                                                            e.stopPropagation()
                                                                            setMobileSubnavItem(
                                                                                item
                                                                            )
                                                                        }}
                                                                        onKeyDown={(
                                                                            e
                                                                        ) => {
                                                                            if (
                                                                                e.key ===
                                                                                    'Enter' ||
                                                                                e.key ===
                                                                                    ' '
                                                                            ) {
                                                                                e.preventDefault()
                                                                                e.stopPropagation()
                                                                                setMobileSubnavItem(
                                                                                    item
                                                                                )
                                                                            }
                                                                        }}
                                                                    >
                                                                        <span
                                                                            className={
                                                                                buttonStyles.navAffordance
                                                                            }
                                                                            aria-hidden="true"
                                                                        />
                                                                    </span>
                                                                ) : null}
                                                            </span>
                                                        )}
                                                    />
                                                </motion.div>
                                            )
                                        })}

                                        <motion.div
                                            variants={itemVariants}
                                            animate="visible"
                                            exit="exit"
                                        >
                                            <DonateButton
                                                label="Donate"
                                                buttonVariant="long"
                                            />
                                        </motion.div>

                                        {!session ? (
                                            <motion.div
                                                variants={itemVariants}
                                                animate="visible"
                                                exit="exit"
                                            >
                                                <LoginButton
                                                    label="Log In"
                                                    buttonVariant="long"
                                                    onClick={() =>
                                                        void onLogin()
                                                    }
                                                />
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                variants={itemVariants}
                                                animate="visible"
                                                exit="exit"
                                            >
                                                <AccountButton
                                                    label="Account"
                                                    buttonVariant="long"
                                                    href="/account"
                                                    avatarSrc={avatarSrc}
                                                    avatarAlt="User avatar"
                                                />
                                            </motion.div>
                                        )}
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="mobile-panel-subnav"
                                    className={styles.mobilePanel}
                                    initial={{ x: '8%', opacity: 0 }}
                                    animate={{ x: '0%', opacity: 1 }}
                                    exit={{ x: '8%', opacity: 0 }}
                                    transition={PANEL_TRANSITION}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            rowGap: '1rem',
                                        }}
                                    >
                                        <div
                                            className={
                                                styles.mobileSubnavTopBar
                                            }
                                        >
                                            <MobileBackButton
                                                onClick={() =>
                                                    setMobileSubnavItem(null)
                                                }
                                            />
                                            <div
                                                className={
                                                    styles.mobileSubnavTitle
                                                }
                                            >
                                                {mobileSubnavItem?.name ?? ''}
                                            </div>
                                        </div>

                                        {mobileSubnavItem?.subnav?.columns?.map(
                                            (col) => (
                                                <div
                                                    key={col.title}
                                                    style={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        rowGap: '0.5rem',
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            padding: '0 10px',
                                                            fontWeight: 600,
                                                            letterSpacing:
                                                                '0.02em',
                                                            color: 'rgba(255,255,255,0.82)',
                                                        }}
                                                    >
                                                        {col.title}
                                                    </div>

                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            flexDirection:
                                                                'column',
                                                            rowGap: '0.75rem',
                                                        }}
                                                    >
                                                        {col.items.map(
                                                            (child) => (
                                                                <motion.div
                                                                    key={
                                                                        child.name
                                                                    }
                                                                    variants={
                                                                        itemVariants
                                                                    }
                                                                    animate="visible"
                                                                    exit="exit"
                                                                >
                                                                    <SubNavButton
                                                                        label={
                                                                            child.name
                                                                        }
                                                                        href={
                                                                            child.href
                                                                        }
                                                                        buttonVariant="long"
                                                                        showChevron={
                                                                            false
                                                                        }
                                                                    />
                                                                </motion.div>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.nav>
            ) : null}
        </AnimatePresence>
    )
}

export function Header() {
    const { session, onLogin } = useAuth()

    const [isOpen, setIsOpen] = useState(false)
    const [activeSubnav, setActiveSubnav] = useState<NavItem | null>(null)
    const [mobileSubnavItem, setMobileSubnavItem] = useState<NavItem | null>(
        null
    )

    const { data: imgSession } = useSession()
    const avatarSrc = imgSession?.user?.image ?? ''

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

    useEffect(() => {
        if (!isOpen) setMobileSubnavItem(null)
    }, [isOpen])

    useEffect(() => {
        if (typeof window === 'undefined') return

        const desktopMQ = window.matchMedia('(min-width: 1280px)')

        const syncToBreakpoint = () => {
            if (desktopMQ.matches) {
                setIsOpen(false)
            } else {
                setActiveSubnav(null)
            }
        }

        syncToBreakpoint()

        const onChange = () => syncToBreakpoint()

        if (typeof desktopMQ.addEventListener === 'function') {
            desktopMQ.addEventListener('change', onChange)
            return () => desktopMQ.removeEventListener('change', onChange)
        } else {
            desktopMQ.addListener(onChange)
            return () => desktopMQ.removeListener(onChange)
        }
    }, [])

    const openSubnav = (item: NavItem) => {
        const hasColumns = !!item.subnav?.columns?.length
        if (!hasColumns) {
            setActiveSubnav(null)
            return
        }
        if (typeof window !== 'undefined' && window.innerWidth < 1280) return
        setActiveSubnav(item)
    }

    const closeSubnav = () => setActiveSubnav(null)

    const isSubnavOpen = !!activeSubnav?.subnav?.columns?.length

    return (
        <>
            <AnimatePresence>
                {isSubnavOpen ? (
                    <motion.div
                        key="desktop-subnav-backdrop"
                        className={styles.desktopSubnavBackdrop}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.16, ease: 'easeOut' }}
                        aria-hidden="true"
                        onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            closeSubnav()
                        }}
                    />
                ) : null}
            </AnimatePresence>

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
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={styles.headerLogoSmall}>
                    <NextLink href="/" onClick={() => closeSubnav()}>
                        <Image
                            src="/images/Logo_White.svg"
                            alt="progressive-victory-logo"
                            width={62.25}
                            height={78}
                        />
                    </NextLink>
                </div>

                <div className={styles.headerLogoLarge}>
                    <NextLink href="/" onClick={() => closeSubnav()}>
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
                        const hasChildren = !!item.subnav?.columns?.length
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
                                <NavButton
                                    label={item.name}
                                    href={item.href}
                                    showChevron={item.name === 'More'}
                                    isSubnavOpen={isActive}
                                    onOpenSubnav={() => openSubnav(item)}
                                    className={
                                        isActive
                                            ? buttonStyles.activeNavItem
                                            : undefined
                                    }
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
                    <DonateButton label="Donate" />

                    {!session ? (
                        <LoginButton
                            label="Log In"
                            onClick={() => void onLogin()}
                        />
                    ) : (
                        <AccountButton
                            label="Account"
                            href="/account"
                            avatarSrc={avatarSrc}
                            avatarAlt="User avatar"
                        />
                    )}
                </div>

                <motion.button
                    type="button"
                    className={styles.headerMenuButton}
                    onClick={() => {
                        closeSubnav()
                        setIsOpen((prev) => !prev)
                    }}
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
                {activeSubnav?.subnav?.columns?.length ? (
                    <motion.div
                        key="desktop-subnav"
                        className={styles.desktopSubnavRoot}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.16, ease: 'easeOut' }}
                        onMouseLeave={closeSubnav}
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={styles.desktopSubnavGrid}>
                            {activeSubnav.subnav.columns.map((col) => (
                                <div
                                    key={col.title}
                                    className={styles.subnavColumn}
                                >
                                    <div className={styles.subnavColumnTitle}>
                                        {col.title}
                                    </div>

                                    <div className={styles.subnavColumnItems}>
                                        {col.items.map((child) => (
                                            <SubNavButton
                                                key={child.name}
                                                label={child.name}
                                                href={child.href}
                                                buttonVariant="default"
                                            />
                                        ))}
                                    </div>
                                </div>
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

            <NavDrawer
                isOpen={isOpen}
                navitems={navitems}
                mobileSubnavItem={mobileSubnavItem}
                setMobileSubnavItem={setMobileSubnavItem}
                session={session}
                avatarSrc={avatarSrc}
                onLogin={onLogin}
            />
        </>
    )
}
