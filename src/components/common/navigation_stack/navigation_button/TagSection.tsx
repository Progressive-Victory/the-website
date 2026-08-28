import type { NavigationButtonType } from './NavigationButton'
import styles from './TagSection.module.css'
import { cn } from '@/util'
import type { ReactElement, MouseEvent } from 'react'

export interface TagProps {
    label?: string
    count?: number
    className?: string
}

export interface TagSectionProps {
    buttonType: NavigationButtonType
    tag?: TagProps
    isAccountButton: boolean
    isCardButton: boolean
    hasActiveGroupChild: boolean
    isGroupOpen: boolean
    onGroupTagClick: (event: MouseEvent<HTMLElement>) => void
}

export function TagSection({
    buttonType,
    tag,
    isAccountButton,
    isCardButton,
    hasActiveGroupChild,
    isGroupOpen,
    onGroupTagClick,
}: TagSectionProps): ReactElement {
    const { label, count, className } = tag ?? {}
    const formattedCount =
        count !== undefined ? count.toLocaleString() : undefined

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
            {buttonType === 'group' ? (
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
                <span className={styles.tagLabel}>{label}</span>
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
