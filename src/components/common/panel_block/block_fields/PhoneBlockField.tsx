import { BlockField, BlockFieldProps } from './BlockField'
import { User } from '@/contracts/data'
import phone from 'phone'

function formatPhoneDisplay(phoneNumber: string): string {
    if (!phoneNumber) return ''
    const parsed = phone(phoneNumber, { country: 'US' })
    if (!parsed.isValid) return phoneNumber
    const digits = parsed.phoneNumber.substring(2)
    return `(${digits.substring(0, 3)}) ${digits.substring(3, 6)}-${digits.substring(6, 10)}`
}

type PhoneBlockFieldProps = Omit<
    BlockFieldProps,
    'getter' | 'editGetter' | 'setter'
> & {
    getter: (user: User) => string | null | undefined
    setter?: (user: User, value: string) => User
}

export function PhoneBlockField({
    getter,
    setter,
    ...props
}: PhoneBlockFieldProps) {
    return (
        <BlockField
            {...props}
            getter={(u) => {
                const raw = getter(u)
                return raw ? formatPhoneDisplay(raw) : undefined
            }}
            editGetter={(u) => getter(u) ?? ''}
            setter={setter}
            inputType="tel"
        />
    )
}
