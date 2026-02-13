'use client'

import styles from './accountInfoForm.module.css'
import { DateField, Form, FormGroup, TextField } from '@/components/form'
import { dateService } from '@/services'
import { useState } from 'react'

interface AccountInformation {
    discordUsername: string
    discordId: string
    firstName: string
    lastName: string
    birthdate: Date
    state: string
    county: string
    city: string
    zip: number
    emailAddress: string
    phoneNumber: string
}

export const AccountInfoForm = ({ form }: { form: AccountInformation }) => {
    const [updatedForm, setUpdatedForm] = useState<AccountInformation>(form)

    return (
        <div className={styles.accountInfoBackground}>
            <Form<AccountInformation>
                form={updatedForm}
                title="Account Information"
                onUpdate={() => undefined}
                onSave={setUpdatedForm}
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
                    <DateField<AccountInformation>
                        label="Date of Birth"
                        getter={(form) =>
                            dateService.isValid(form.birthdate)
                                ? new Date(
                                      dateService.toISODateString(
                                          form.birthdate
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
                    <TextField label="State" field="state" />
                    <TextField label="County" field="county" />
                    <TextField label="City" field="city" />
                    <TextField<AccountInformation>
                        label="Zip Code"
                        getter={(form) =>
                            form.zip.toString().padStart(5, '0').slice(-5)
                        }
                        setter={(form, field) => ({
                            ...form,
                            zip: field
                                ? +field
                                      .replace(/[^\d]/, '')
                                      .padStart(5, '0')
                                      .slice(-5)
                                : 0,
                        })}
                    />
                    <TextField label="Email" field="emailAddress" />
                    <TextField label="Phone Number" field="phoneNumber" />
                </FormGroup>
            </Form>
        </div>
    )
}
