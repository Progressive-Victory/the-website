export type DropdownButtonVariant = 'long' | 'short' | 'minimal'

interface DropdownVariantConfig {
    ariaHasPopup: 'menu' | 'dialog'
    buttonClassName: string
    chevronClassName?: string
    chevronSize?: number
    showLabel: boolean
    showEllipsisIcon: boolean
}

export function getDropdownVariantConfig(
    variant: DropdownButtonVariant,
    classes: {
        long: string
        short: string
        minimal: string
        chevron: string
        chevronMinimal: string
    }
): DropdownVariantConfig {
    if (variant === 'short') {
        return {
            ariaHasPopup: 'menu',
            buttonClassName: classes.short,
            showLabel: false,
            showEllipsisIcon: true,
        }
    }

    if (variant === 'minimal') {
        return {
            ariaHasPopup: 'dialog',
            buttonClassName: classes.minimal,
            chevronClassName: classes.chevronMinimal,
            chevronSize: 12,
            showLabel: true,
            showEllipsisIcon: false,
        }
    }

    return {
        ariaHasPopup: 'dialog',
        buttonClassName: classes.long,
        chevronClassName: classes.chevron,
        chevronSize: 14,
        showLabel: true,
        showEllipsisIcon: false,
    }
}
