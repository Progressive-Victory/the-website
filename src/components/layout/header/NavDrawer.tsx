'use client'

import { NavItem } from '../types'
import styles from '@/components/layout/header.module.css'
import { AnimatePresence, motion } from 'motion/react'
import { TokenClaims } from 'pv-contracts/data'
import { drawerTransition } from './headerAnimations'
import { MobileMainPanel } from './MobileMainPanel'
import { MobileSubnavPanel } from './MobileSubnavPanel'

interface NavDrawerProps {
    isOpen: boolean
    navitems: NavItem[]
    mobileSubnavItem: NavItem | null
    setMobileSubnavItem: (item: NavItem | null) => void
    isSessionLoading: boolean
    session: TokenClaims | null
    discordUserId: string | undefined
    avatarImageId: string | undefined
    onLogin: () => Promise<void>
}

export function NavDrawer({
    isOpen,
    navitems,
    mobileSubnavItem,
    setMobileSubnavItem,
    isSessionLoading,
    session,
    discordUserId,
    avatarImageId,
    onLogin,
}: NavDrawerProps) {
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
                            {mobileSubnavItem ? (
                                <MobileSubnavPanel
                                    item={mobileSubnavItem}
                                    onBack={() => setMobileSubnavItem(null)}
                                />
                            ) : (
                                <MobileMainPanel
                                    navitems={navitems}
                                    onOpenSubnav={setMobileSubnavItem}
                                    isSessionLoading={isSessionLoading}
                                    session={session}
                                    discordUserId={discordUserId}
                                    avatarImageId={avatarImageId}
                                    onLogin={onLogin}
                                />
                            )}
                        </AnimatePresence>
                    </div>
                </motion.nav>
            ) : null}
        </AnimatePresence>
    )
}
