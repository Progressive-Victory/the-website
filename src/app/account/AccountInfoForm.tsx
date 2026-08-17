import styles from './account.module.css'
import {
    Form,
    DateField,
    FormGroup,
    PhoneField,
    TextField,
    DropDownField,
} from '@/components/common/forms'
import { ShirtSize, User } from '@/contracts/data'
import { stateOptions } from '@/models'
import { dateService } from '@/services'
import { useState } from 'react'

interface AccountInfoFormProps {
    user: User
    onSave: (user: User) => void
    onUpdateUser: (user: User) => void
    subtitle?: string
    avatar?: React.ReactNode
    title?: string
    hasMatchedDonor?: boolean
    showShirtSize?: boolean
}

//Need to move these to API
const shirtSizeOptions = [
    { value: '', label: 'No shirt size selected' },
    { value: ShirtSize.ExtraSmall, label: 'Extra Small' },
    { value: ShirtSize.Small, label: 'Small' },
    { value: ShirtSize.Medium, label: 'Medium' },
    { value: ShirtSize.Large, label: 'Large' },
    { value: ShirtSize.ExtraLarge, label: 'Extra Large' },
    { value: ShirtSize.DoubleExtraLarge, label: 'Double XL' },
]

const shirtSizeLabels: Record<ShirtSize, string> = {
    [ShirtSize.ExtraSmall]: 'Extra Small',
    [ShirtSize.Small]: 'Small',
    [ShirtSize.Medium]: 'Medium',
    [ShirtSize.Large]: 'Large',
    [ShirtSize.ExtraLarge]: 'Extra Large',
    [ShirtSize.DoubleExtraLarge]: 'Double XL',
}

const missingAddressInfoText = '*Info needed to ship card'
const missingShirtSizeInfoText =
    '*Info needed to ship Inner Circle merch bundle'
const stateOptionsWithEmpty = [
    { value: '', label: 'No state selected' },
    ...stateOptions,
]

export const AccountInfoForm = ({
    user,
    onSave,
    onUpdateUser,
    subtitle,
    avatar,
    title = 'Account Information',
    hasMatchedDonor = false,
    showShirtSize = false,
}: AccountInfoFormProps) => {
    const [isEditing, setIsEditing] = useState(false)

    const handleFormSave = (user: User) => {
        onUpdateUser(user)
        onSave(user)
    }

    const showAddressLine2 =
        isEditing || Boolean(user.address.addressLine2?.trim()?.length)

    const hasAddressForShipping = (user: User) =>
        Boolean(
            user.address.addressLine1?.trim() &&
            user.address.city?.trim() &&
            user.address.state?.trim() &&
            user.address.zip?.trim()
        )

    const normalizeText = (value?: string | null) => {
        const trimmed = value?.trim() ?? ''
        return trimmed.length ? trimmed : null
    }

    return (
        <div className={styles.contentBackground}>
            <Form<User>
                form={user}
                title={title}
                subtitle={subtitle}
                avatar={avatar}
                onUpdate={(state) => setIsEditing(state.mode === 'edit')}
                onSave={handleFormSave}
            >
                <FormGroup title="">
                    {isEditing ? (
                        <TextField label="First Name" field="firstName" />
                    ) : (
                        <TextField<User>
                            label="Full Name"
                            getter={(user) =>
                                `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() ||
                                null
                            }
                            readonly
                        />
                    )}
                    {isEditing && (
                        <TextField label="Last Name" field="lastName" />
                    )}
                    <TextField<User>
                        label="Discord Username"
                        getter={(user) =>
                            user.discordUsers
                                ? `@${user.discordUsers[0].username}`
                                : null
                        }
                        readonly
                    />
                    <PhoneField label="Phone Number" field="phone" required />
                    <TextField label="Email" field="email" readonly />
                    <DateField<User>
                        label="Date of Birth"
                        getter={(user) =>
                            dateService.fromISODateString(user.birthdate)
                        }
                        field="birthdate"
                        format={{
                            timeZone: 'UTC',
                            dateStyle: 'medium',
                        }}
                    />
                    {!isEditing && !hasAddressForShipping(user) ? (
                        <TextField<User>
                            label={
                                showAddressLine2 ? 'Address Line 1' : 'Address'
                            }
                            getter={() => missingAddressInfoText}
                            readonly
                            readonlyClassName={styles.shippingInfoWarningText}
                        />
                    ) : (
                        <TextField<User>
                            label={
                                showAddressLine2 ? 'Address Line 1' : 'Address'
                            }
                            getter={(user) => user.address.addressLine1}
                            setter={(user, field) => ({
                                ...user,
                                address: {
                                    ...user.address,
                                    addressLine1:
                                        normalizeText(field)?.slice(0, 100) ??
                                        null,
                                },
                            })}
                        />
                    )}
                    {showAddressLine2 && (
                        <TextField<User>
                            label="Address Line 2"
                            getter={(user) => user.address.addressLine2}
                            setter={(user, field) => ({
                                ...user,
                                address: {
                                    ...user.address,
                                    addressLine2:
                                        normalizeText(field)?.slice(0, 100) ??
                                        null,
                                },
                            })}
                        />
                    )}
                    <TextField<User>
                        label="Zip Code"
                        getter={(user) =>
                            user.address.zip
                                ? user.address.zip.padStart(5, '0').slice(-5)
                                : null
                        }
                        setter={(user, field) => ({
                            ...user,
                            address: {
                                ...user.address,
                                zip: field?.trim().length
                                    ? field
                                          .replace(/[^\d]/g, '')
                                          .padStart(5, '0')
                                          .slice(-5)
                                    : null,
                            },
                        })}
                        validator={(field) =>
                            !field?.length || field?.length == 5
                        }
                    />
                    <TextField<User>
                        label="City"
                        getter={(user) => user.address.city}
                        setter={(user, field) => ({
                            ...user,
                            address: {
                                ...user.address,
                                city:
                                    normalizeText(field)?.slice(0, 50) ?? null,
                            },
                        })}
                    />
                    <DropDownField<User>
                        label="State"
                        getter={(user) => user.address.state}
                        setter={(user, field) => ({
                            ...user,
                            address: {
                                ...user.address,
                                state: (field as string) || null,
                            },
                        })}
                        options={stateOptionsWithEmpty}
                    />
                    {hasMatchedDonor &&
                        showShirtSize &&
                        (isEditing ? (
                            <DropDownField<User>
                                label="Shirt Size"
                                getter={(user) => user.shirtSize ?? ''}
                                setter={(user, field) => ({
                                    ...user,
                                    shirtSize: field
                                        ? (field as ShirtSize)
                                        : null,
                                })}
                                options={shirtSizeOptions}
                            />
                        ) : user.shirtSize ? (
                            <TextField<User>
                                label="Shirt Size"
                                getter={(user) =>
                                    user.shirtSize
                                        ? shirtSizeLabels[user.shirtSize]
                                        : null
                                }
                                readonly
                            />
                        ) : (
                            <TextField<User>
                                label="Shirt Size"
                                getter={() => missingShirtSizeInfoText}
                                readonly
                                readonlyClassName={
                                    styles.shippingInfoWarningText
                                }
                            />
                        ))}
                </FormGroup>
            </Form>
        </div>
    )
}
