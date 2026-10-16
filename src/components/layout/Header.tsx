'use client'

import styles from '@/components/layout/header.module.css'
import { AnimatePresence, motion } from 'motion/react'
import Image from 'next/image'
import NextLink from 'next/link'
import { AuthActions } from './header/AuthActions'
import { DesktopNav } from './header/DesktopNav'
import { DesktopSubnav } from './header/DesktopSubnav'
import { MobileMenuControls } from './header/MobileMenuControls'
import { NavDrawer } from './header/NavDrawer'
import { useHeaderNav } from './header/useHeaderNav'

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
export function Header() {
    const {
        session,
        onLogin,
        isSessionLoading,
        isOpen,
        activeSubnav,
        mobileSubnavItem,
        setMobileSubnavItem,
        discordUsers,
        resolvedNavitems,
        openSubnav,
        closeSubnav,
        toggleMenu,
        closeMenu,
        isSubnavOpen,
    } = useHeaderNav()

    const discordUserId = discordUsers?.[0]?.id
    const avatarImageId = discordUsers?.[0]?.image

    return (
        <>
            <DesktopSubnav
                activeSubnav={activeSubnav}
                isOpen={isSubnavOpen}
                onClose={closeSubnav}
            />

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
                    <NextLink href="/" onClick={closeSubnav}>
                        <Image
                            src="/images/Logo_White.svg"
                            alt="progressive-victory-logo"
                            width={62.25}
                            height={78}
                        />
                    </NextLink>
                </div>

                <div className={styles.headerLogoLarge}>
                    <NextLink href="/" onClick={closeSubnav}>
                        <Image
                            src="/images/LogoFull.webp"
                            alt="progressive-victory-logo"
                            width={256}
                            height={78}
                        />
                    </NextLink>
                </div>

                <DesktopNav
                    navitems={resolvedNavitems}
                    activeSubnav={activeSubnav}
                    onOpenSubnav={openSubnav}
                />

                <div className={styles.headerRightActions}>
                    <AuthActions
                        isSessionLoading={isSessionLoading}
                        session={session}
                        discordUserId={discordUserId}
                        avatarImageId={avatarImageId}
                        onLogin={onLogin}
                    />
                </div>

                <MobileMenuControls isOpen={isOpen} onToggle={toggleMenu} />
            </header>

            <AnimatePresence>
                {isOpen ? (
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
                        onClick={closeMenu}
                    />
                ) : null}
            </AnimatePresence>

            <NavDrawer
                isOpen={isOpen}
                navitems={resolvedNavitems}
                mobileSubnavItem={mobileSubnavItem}
                setMobileSubnavItem={setMobileSubnavItem}
                isSessionLoading={isSessionLoading}
                session={session}
                discordUserId={discordUserId}
                avatarImageId={avatarImageId}
                onLogin={onLogin}
            />
        </>
    )
}
