import type { ButtonStyleKey, ButtonVariant } from './types'
import styles from '@/components/common/buttons/button.module.css'

export function buildButtonClassName(opts: {
    styleKey: ButtonStyleKey
    buttonVariant: ButtonVariant
    showNavChevron: boolean
    isAccountCompact: boolean
}) {
    const { styleKey, buttonVariant, showNavChevron, isAccountCompact } = opts

    const styleClass = isAccountCompact
        ? styles.accountCompact
        : styles[styleKey]
    const variantClass =
        buttonVariant === 'long' ? styles.longVariant : styles.defaultVariant

    const navClass = showNavChevron ? styles.navButton : ''
    const longNavClass = showNavChevron ? styles.longNavButton : ''

    return [styles.buttonBase, styleClass, variantClass, navClass, longNavClass]
        .filter(Boolean)
        .join(' ')
}
