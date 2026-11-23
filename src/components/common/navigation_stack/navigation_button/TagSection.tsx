import type { NavigationButtonType } from './NavigationButton'
import styles from './TagSection.module.css'
import { cn } from '@/util'
import type { ReactElement, MouseEvent } from 'react'
import { FaLock } from 'react-icons/fa6'

export interface TagProps {
    label?: string
    count?: number
    className?: string
    labelClassName?: string
}

export interface TagSectionProps {
    buttonType: NavigationButtonType
    tag?: TagProps
    locked?: boolean
    isAccountButton: boolean
    isCardButton: boolean
    hasActiveGroupChild: boolean
    isGroupOpen: boolean
    onGroupTagClick: (event: MouseEvent<HTMLElement>) => void
}

export function TagSection({
    buttonType,
    tag,
    locked = false,
    isAccountButton,
    isCardButton,
    hasActiveGroupChild,
    isGroupOpen,
    onGroupTagClick,
}: TagSectionProps): ReactElement {
    const { label, count, className, labelClassName } = tag ?? {}
    const formattedCount = count?.toLocaleString()

    return (
        <span
            className={cn(
                styles.tagSection,
                label && styles.tagSectionWithLabel,
                isAccountButton && styles.accountTagSection,
                isCardButton && styles.cardTagSection,
                className
            )}
        >
            {locked ? (
                <span
                    className={cn(
                        styles.count,
                        isCardButton && styles.cardCount,
                        styles.lockTag
                    )}
                    aria-label="Locked"
                >
                    <span className={styles.lockSizer} aria-hidden="true">
                        0
                    </span>
                    <FaLock className={styles.lockIcon} aria-hidden="true" />
                </span>
            ) : buttonType === 'group' ? (
                <span
                    aria-hidden="true"
                    className={styles.groupTagButton}
                    data-collapsed-active-child={
                        hasActiveGroupChild && !isGroupOpen
                    }
                    data-open={isGroupOpen}
                    onClick={onGroupTagClick}
                >
                    <span className={styles.groupTagChevron} />
                </span>
            ) : label ? (
                <span className={cn(styles.tagLabel, labelClassName)}>
                    {label}
                </span>
            ) : (
                !isAccountButton &&
                count !== undefined && (
                    <span
                        className={cn(
                            styles.count,
                            isCardButton && styles.cardCount
                        )}
                    >
                        {formattedCount}
                    </span>
                )
            )}
        </span>
    )
}
