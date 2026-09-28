'use client'

import { NavItem } from '../types'
import { DonateButton } from '@/components/common/buttons/button_types/DonateButton'
import styles from '@/components/layout/header.module.css'
import { motion } from 'motion/react'
import { TokenClaims } from 'pv-contracts/data'
import { AuthActions } from './AuthActions'
import { PANEL_TRANSITION, itemVariants } from './headerAnimations'
import { MobileNavItem } from './MobileNavItem'

interface MobileMainPanelProps {
    navitems: NavItem[]
    onOpenSubnav: (item: NavItem) => void
    isSessionLoading: boolean
    session: TokenClaims | null
    discordUserId: string | undefined
    avatarImageId: string | undefined
    onLogin: () => Promise<void>
}

export function MobileMainPanel({
    navitems,
    onOpenSubnav,
    isSessionLoading,
    session,
    discordUserId,
    avatarImageId,
    onLogin,
}: MobileMainPanelProps) {
    return (
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
                {navitems.map((item) => (
                    <MobileNavItem
                        key={item.name}
                        item={item}
                        onOpenSubnav={onOpenSubnav}
                    />
                ))}

                <motion.div
                    variants={itemVariants}
                    animate="visible"
                    exit="exit"
                >
                    <DonateButton label="Donate" buttonVariant="long" />
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    animate="visible"
                    exit="exit"
                >
                    <AuthActions
                        isSessionLoading={isSessionLoading}
                        session={session}
                        discordUserId={discordUserId}
                        avatarImageId={avatarImageId}
                        onLogin={onLogin}
                        buttonVariant="long"
                        showDonate={false}
                    />
                </motion.div>
            </div>
        </motion.div>
    )
}
