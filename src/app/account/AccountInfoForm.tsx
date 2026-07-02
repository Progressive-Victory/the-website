import styles from './account.module.css'
import {
    Form,
    DateField,
    FormGroup,
    PhoneField,
    TextField,
} from '@/components/common/forms'
import { User } from '@/contracts/data'
import { dateService } from '@/services'
import { useState } from 'react'

interface AccountInfoFormProps {
    user: User
    onSave: (user: User) => void
    subtitle?: string
    avatar?: React.ReactNode
    title?: string
}

export const AccountInfoForm = ({
    user,
    onSave,
    subtitle,
    avatar,
    title = 'Account Information',
}: AccountInfoFormProps) => {
    const [updatedUser, setUpdatedUser] = useState<User>(user)
    const [isEditing, setIsEditing] = useState(false)

    const handleFormSave = (user: User) => {
        setUpdatedUser(user)

        onSave(user)
    }

    const showAddressLine2 =
        isEditing || Boolean(updatedUser.address.addressLine2?.trim()?.length)

    return (
        <div className={styles.contentBackground}>
            <Form<User>
                form={updatedUser}
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
                    <PhoneField label="Phone Number" field="phone" />
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
                    <TextField<User>
                        label={showAddressLine2 ? 'Address Line 1' : 'Address'}
                        getter={(user) => user.address.addressLine1}
                        setter={(user, field) => ({
                            ...user,
                            address: {
                                ...user.address,
                                addressLine1: field?.slice(0, 100) ?? null,
                            },
                        })}
                    />
                    {showAddressLine2 && (
                        <TextField<User>
                            label="Address Line 2"
                            getter={(user) => user.address.addressLine2}
                            setter={(user, field) => ({
                                ...user,
                                address: {
                                    ...user.address,
                                    addressLine2: field?.slice(0, 100) ?? null,
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
                                zip:
                                    field
                                        ?.replace(/[^\d]/, '')
                                        ?.padStart(5, '0')
                                        ?.slice(-5) ?? null,
                            },
                        })}
                        validator={(field) => field?.length == 5}
                    />
                    <TextField<User>
                        label="City"
                        getter={(user) => user.address.city}
                        setter={(user, field) => ({
                            ...user,
                            address: {
                                ...user.address,
                                city: field?.slice(0, 50) ?? null,
                            },
                        })}
                    />
                    <TextField<User>
                        label="State"
                        getter={(user) => user.address.state}
                        setter={(user, field) => ({
                            ...user,
                            address: {
                                ...user.address,
                                state:
                                    field?.trim()?.toUpperCase()?.slice(0, 2) ??
                                    null,
                            },
                        })}
                        validator={(field) => field?.length == 2}
                    />
                </FormGroup>
            </Form>
        </div>
    )
}
