'use client'

import { NavItem } from '../types'
import buttonStyles from '@/components/common/buttons/Button.module.css'
import { NavButton } from '@/components/common/buttons/button_types/NavButton'
import styles from '@/components/layout/header.module.css'

interface DesktopNavItemProps {
    item: NavItem
    isActive: boolean
    shouldDim: boolean
    onOpenSubnav: (item: NavItem) => void
}

function DesktopNavItem({
    item,
    isActive,
    shouldDim,
    onOpenSubnav,
}: DesktopNavItemProps) {
    const hasChildren = !!item.subnav?.columns?.length
    const wrapperClassName = [
        styles.desktopNavItemWrapper,
        isActive ? styles.navItemActive : '',
        shouldDim ? styles.navItemDimmed : '',
    ]
        .filter(Boolean)
        .join(' ')

    return (
        <div
            className={wrapperClassName}
            onMouseEnter={() => onOpenSubnav(item)}
            onFocus={() => onOpenSubnav(item)}
        >
            <NavButton
                label={item.name}
                href={item.href}
                showChevron={item.name === 'More'}
                disabled={item.name === 'More'}
                isSubnavOpen={isActive}
                onOpenSubnav={() => onOpenSubnav(item)}
                className={isActive ? buttonStyles.activeNavItem : undefined}
            />

            {hasChildren ? (
                <span className={styles.srOnly}>
                    {isActive ? 'Submenu expanded' : 'Has submenu'}
                </span>
            ) : null}
        </div>
    )
}

interface DesktopNavProps {
    navitems: NavItem[]
    activeSubnav: NavItem | null
    onOpenSubnav: (item: NavItem) => void
}

export function DesktopNav({
    navitems,
    activeSubnav,
    onOpenSubnav,
}: DesktopNavProps) {
    return (
        <nav
            className={styles.headerCenterNav}
            aria-label="Primary navigation"
        >
            {navitems.map((item) => (
                <DesktopNavItem
                    key={item.name}
                    item={item}
                    isActive={activeSubnav?.name === item.name}
                    shouldDim={!!activeSubnav && activeSubnav.name !== item.name}
                    onOpenSubnav={onOpenSubnav}
                />
            ))}
        </nav>
    )
}
