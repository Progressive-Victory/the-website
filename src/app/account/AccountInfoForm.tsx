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

const stateOptions = [
    { value: '', label: 'Select state', disabled: true },
    { value: 'AL', label: 'Alabama' },
    { value: 'AK', label: 'Alaska' },
    { value: 'AZ', label: 'Arizona' },
    { value: 'AR', label: 'Arkansas' },
    { value: 'CA', label: 'California' },
    { value: 'CO', label: 'Colorado' },
    { value: 'CT', label: 'Connecticut' },
    { value: 'DE', label: 'Delaware' },
    { value: 'DC', label: 'District Of Columbia' },
    { value: 'FL', label: 'Florida' },
    { value: 'GA', label: 'Georgia' },
    { value: 'HI', label: 'Hawaii' },
    { value: 'ID', label: 'Idaho' },
    { value: 'IL', label: 'Illinois' },
    { value: 'IN', label: 'Indiana' },
    { value: 'IA', label: 'Iowa' },
    { value: 'KS', label: 'Kansas' },
    { value: 'KY', label: 'Kentucky' },
    { value: 'LA', label: 'Louisiana' },
    { value: 'ME', label: 'Maine' },
    { value: 'MD', label: 'Maryland' },
    { value: 'MA', label: 'Massachusetts' },
    { value: 'MI', label: 'Michigan' },
    { value: 'MN', label: 'Minnesota' },
    { value: 'MS', label: 'Mississippi' },
    { value: 'MO', label: 'Missouri' },
    { value: 'MT', label: 'Montana' },
    { value: 'NE', label: 'Nebraska' },
    { value: 'NV', label: 'Nevada' },
    { value: 'NH', label: 'New Hampshire' },
    { value: 'NJ', label: 'New Jersey' },
    { value: 'NM', label: 'New Mexico' },
    { value: 'NY', label: 'New York' },
    { value: 'NC', label: 'North Carolina' },
    { value: 'ND', label: 'North Dakota' },
    { value: 'OH', label: 'Ohio' },
    { value: 'OK', label: 'Oklahoma' },
    { value: 'OR', label: 'Oregon' },
    { value: 'PA', label: 'Pennsylvania' },
    { value: 'RI', label: 'Rhode Island' },
    { value: 'SC', label: 'South Carolina' },
    { value: 'SD', label: 'South Dakota' },
    { value: 'TN', label: 'Tennessee' },
    { value: 'TX', label: 'Texas' },
    { value: 'UT', label: 'Utah' },
    { value: 'VT', label: 'Vermont' },
    { value: 'VA', label: 'Virginia' },
    { value: 'WA', label: 'Washington' },
    { value: 'WV', label: 'West Virginia' },
    { value: 'WI', label: 'Wisconsin' },
    { value: 'WY', label: 'Wyoming' },
]

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
        <div className={styles.accountInfoBackground}>
            <Form<User>
                form={updatedUser}
                title={title}
                subtitle={subtitle}
                avatar={avatar}
                onUpdate={(state) => setIsEditing(state.editing)}
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
                        getter={(user) => dateService.fromISODateString(user.birthdate)}
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
                    <DropDownField<User>
                        label="State"
                        field="state"
                        options = {stateOptions}
                    />
                </FormGroup>
            </Form>
        </div>
    )
}
