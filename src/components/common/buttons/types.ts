export type ButtonStyleKey =
    | 'primary'
    | 'secondary'
    | 'plain'
    | 'prominent'
    | 'minimal'
export type ButtonVariant = 'default' | 'long' | 'mobile'

export interface BaseVisualProps {
    label: string
    buttonVariant?: ButtonVariant
    showChevron?: boolean
    className?: string
    disabled?: boolean
}
