'use client'

import { NavItem } from '../types'
import { BaseButton } from '@/components/common/buttons/Button'
import buttonStyles from '@/components/common/buttons/Button.module.css'
import { motion } from 'motion/react'
import { itemVariants } from './headerAnimations'
import { SubnavChevronButton } from './SubnavChevronButton'

interface MobileNavItemProps {
    item: NavItem
    onOpenSubnav: (item: NavItem) => void
}

export function MobileNavItem({ item, onOpenSubnav }: MobileNavItemProps) {
    const hasChildren = !!item.subnav?.columns?.length

    return (
        <motion.div
            variants={itemVariants}
            animate="visible"
            exit="exit"
        >
            <BaseButton
                label={item.name}
                className={buttonStyles.plain}
                buttonVariant="long"
                showChevron={hasChildren}
                rotateChevronOnHover={false}
                href={item.name === 'More' ? '#' : item.href}
                renderContent={({ showNavChevron }) => (
                    <span className={buttonStyles.buttonContent}>
                        <span className={buttonStyles.buttonLabel}>
                            {item.name}
                        </span>
                        {showNavChevron ? (
                            <SubnavChevronButton
                                itemName={item.name}
                                onOpen={() => onOpenSubnav(item)}
                            />
                        ) : null}
                    </span>
                )}
            />
        </motion.div>
    )
}
