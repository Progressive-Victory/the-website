'use client'

import styles from './accountInfoForm.module.css'
import { DateField, Form, FormGroup, TextField } from '@/components/form'
import { User } from '@/contracts/data'
import { dateService } from '@/services'
import { useState } from 'react'

export const AccountInfoForm = ({ user }: { user: User }) => {
    const [updatedUser, setUpdatedUser] = useState<User>(user)

    return (
        <div className={styles.accountInfoBackground}>
            <Form<User>
                form={updatedUser}
                title="Account Information"
                onUpdate={() => undefined}
                onSave={setUpdatedUser}
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
                    <TextField<User>
                        label="Discord ID"
                        getter={(user) =>
                            user.discordUsers ? user.discordUsers[0].id : null
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
                        label="State"
                        getter={(user) => user.location?.state ?? null}
                    />
                    <TextField<User>
                        label="County"
                        getter={(user) => user.location?.county ?? null}
                    />
                    <TextField<User>
                        label="City"
                        getter={(user) => user.location?.city ?? null}
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
                    <TextField label="Email" field="email" />
                    <TextField label="Phone Number" field="phone" />
                </FormGroup>
            </Form>
        </div>
    )
}
