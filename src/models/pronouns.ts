export const pronounOptions = [
    { value: '', label: 'None' },
    { value: 'he/him', label: 'he/him' },
    { value: 'she/her', label: 'she/her' },
    { value: 'they/them', label: 'they/them' },
    { value: 'any/all', label: 'any/all' },
    { value: 'other', label: 'other' },
]

export function pronounOptionsWith(existing?: string | null) {
    const isCustom =
        !!existing &&
        !pronounOptions.some((option) => option.value === existing)

    return isCustom
        ? [...pronounOptions, { value: existing, label: existing }]
        : pronounOptions
}
