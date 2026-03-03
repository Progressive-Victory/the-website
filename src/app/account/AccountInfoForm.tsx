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

export const AccountInfoForm = ({
    user,
    onSave,
}: {
    user: User
    onSave: (user: User) => void
}) => {
    const [updatedUser, setUpdatedUser] = useState<User>(user)
    const [isEditing, setIsEditing] = useState(false)

    const handleFormSave = (user: User) => {
        setUpdatedUser(user)

        onSave(user)
    }

    return (
        <div className={styles.accountInfoBackground}>
            <Form<User>
                form={updatedUser}
                title="Account Information"
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
                        getter={(user) =>
                            dateService.isValid(user.birthdate)
                                ? new Date(
                                      dateService.toISODateString(
                                          user.birthdate
                                      )!
                                  )
                                : null
                        }
                        field="birthdate"
                        format={{
                            timeZone: 'UTC',
                            dateStyle: 'medium',
                        }}
                    />
                    <TextField<User>
                        label="Zip Code"
                        getter={(user) =>
                            user.location?.zip
                                ? user.location?.zip
                                      .toString()
                                      .padStart(5, '0')
                                      .slice(-5)
                                : null
                        }
                        setter={(user, field) => ({
                            ...user,
                            location: field
                                ? {
                                      ...(user.location ?? {
                                          city: '',
                                          county: '',
                                          state: '',
                                      }),
                                      zip: +field
                                          .replace(/[^\d]/, '')
                                          .padStart(5, '0')
                                          .slice(-5),
                                  }
                                : null,
                        })}
                    />
                    <TextField<User>
                        label="City"
                        getter={(user) => user.location?.city ?? null}
                        readonly
                    />
                    <TextField<User>
                        label="State"
                        getter={(user) => user.location?.state ?? null}
                        readonly
                    />
                </FormGroup>
            </Form>
        </div>
    )
}
