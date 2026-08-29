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
    if (variant === 'chevron') {
        return (
            <button
                aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                className={cn(styles.toggleButton, className)}
                onClick={onToggle}
                title={isOpen ? 'Collapse' : 'Expand'}
                type="button"
            >
                <FiChevronLeft
                    className={cn(
                        styles.toggleIcon,
                        !isOpen && styles.toggleIconClosed
                    )}
                    size={size ?? 20}
                />
            </button>
        )
    }

    return (
        <button
            aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            className={cn(styles.panelToggleButton, className)}
            onClick={onToggle}
            title={isOpen ? 'Collapse' : 'Expand'}
            type="button"
        >
            <SidebarIcon className={styles.sidebarIcon} size={size ?? 22} />
        </button>
    )
}
