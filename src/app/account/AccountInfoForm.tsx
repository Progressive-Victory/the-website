import styles from './accountInfoForm.module.css'
import {
    Form,
    DateField,
    FormGroup,
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

    const handleFormSave = (user: User) => {
        setUpdatedUser(user)

        onSave(user)
    }

    return (
        <div className={styles.accountInfoBackground}>
            <Form<User>
                form={updatedUser}
                title="Account Information"
                onUpdate={() => undefined}
                onSave={handleFormSave}
            >
                <FormGroup title="">
                    <TextField<User>
                        label="Discord Username"
                        getter={(user) =>
                            user.discordUsers
                                ? user.discordUsers[0].username
                                : null
                        }
                        readonly
                    />
                    <TextField label="First Name" field="firstName" />
                    <TextField label="Last Name" field="lastName" />
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
                        label="State"
                        getter={(user) => user.location?.state ?? null}
                        readonly
                    />
                    <TextField<User>
                        label="County"
                        getter={(user) => user.location?.county ?? null}
                        readonly
                    />
                    <TextField<User>
                        label="City"
                        getter={(user) => user.location?.city ?? null}
                        readonly
                    />
                    <TextField label="Email" field="email" />
                    <TextField label="Phone Number" field="phone" />
                </FormGroup>
            </Form>
        </div>
    )
}
