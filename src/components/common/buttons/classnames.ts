import type { ButtonStyleKey, ButtonVariant } from './types'
import styles from '@/components/common/buttons/button.module.css'

export function buildButtonClassName(args: {
    styleKey: ButtonStyleKey
    buttonVariant: ButtonVariant
    showNavChevron: boolean
    isAccountCompact: boolean
}) {
    const { styleKey, buttonVariant, showNavChevron, isAccountCompact } = args

    const variantClass =
        buttonVariant === 'long'
            ? styles.longVariant
            : buttonVariant === 'mobile'
              ? styles.wideVariant
              : styles.defaultVariant

    return [
        styles.buttonBase,
        styles[styleKey],
        variantClass,
        showNavChevron ? styles.navButton : '',
        buttonVariant === 'long' && showNavChevron ? styles.longNavButton : '',
        isAccountCompact ? styles.accountCompact : '',
    ]
        .filter(Boolean)
        .join(' ')
}
