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
                    <TextField
                        label="Discord Username"
                        field="discordUsername"
                        readonly
                    />
                    <TextField label="Discord ID" field="discordId" readonly />
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
                        getter={(user) =>
                            user.location?.county
                                ? user.location?.county
                                      .toString()
                                      .padStart(5, '0')
                                      .slice(-5)
                                : null
                        }
                    />
                    <TextField<User>
                        label="County"
                        getter={(user) =>
                            user.location?.county
                                ? user.location?.county
                                      .toString()
                                      .padStart(5, '0')
                                      .slice(-5)
                                : null
                        }
                    />
                    <TextField<User>
                        label="City"
                        getter={(user) =>
                            user.location?.city
                                ? user.location?.city
                                      .toString()
                                      .padStart(5, '0')
                                      .slice(-5)
                                : null
                        }
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
                    <TextField label="Email" field="emailAddress" />
                    <TextField label="Phone Number" field="phoneNumber" />
                </FormGroup>
            </Form>
        </div>
    )
}
