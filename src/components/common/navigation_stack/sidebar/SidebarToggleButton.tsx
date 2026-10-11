import styles from './SidebarToggleButton.module.css'
import { SidebarIcon } from '@/components/common/icons/SidebarIcon'
import { cn } from '@/util'
import type { ReactElement } from 'react'
import { FiChevronLeft } from 'react-icons/fi'

interface SidebarToggleButtonProps {
    isOpen: boolean
    onToggle: () => void
    variant?: 'icon' | 'chevron'
    className?: string
    size?: number
}

export function SidebarToggleButton({
    isOpen,
    onToggle,
    variant = 'icon',
    className,
    size,
}: SidebarToggleButtonProps): ReactElement {
    const icon =
        variant === 'chevron' ? (
            <FiChevronLeft
                className={cn(
                    styles.toggleIcon,
                    !isOpen && styles.toggleIconClosed
                )}
                size={size ?? 20}
            />
        ) : (
            <SidebarIcon className={styles.sidebarIcon} size={size ?? 22} />
        )

    return (
        <button
            aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            className={cn(
                variant === 'chevron'
                    ? styles.toggleButton
                    : styles.panelToggleButton,
                className
            )}
            onClick={onToggle}
            title={isOpen ? 'Collapse' : 'Expand'}
            type="button"
        >
            {icon}
        </button>
    )
}
