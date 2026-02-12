'use client'

import { StateSelector } from './StateSelector'
import styles from './accountInfoForm.module.css'
import {
    CheckboxField,
    DateField,
    Form,
    FormGroup,
    FormGroupProps,
    FormState,
    SelectManyField,
    TextField,
} from '@/components/form'
import { dateService } from '@/services'
import { useState } from 'react'

interface MutableFields {
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

interface AccountInformation extends MutableFields {
    discordUsername: string
    discordId: string
}

export const AccountInfoForm = ({ form }: { form: AccountInformation }) => {
    const [updatedForm, setUpdatedForm] = useState<MutableFields>(form)

    const onSave = (newForm: AccountInformation) => {
        setUpdatedForm(newForm)
    }

    return (
        <div className={styles.accountInfoBackground}>
            <Form<AccountInformation>
                form={updatedForm}
                title="Account Information"
                onUpdate={() => {}}
                onSave={onSave}
            >
                <FormGroup>
                    <TextField
                        label="Discord Username"
                        field="discordUsername"
                        readonly
                    />
                    <TextField label="Discord ID" field="discordId" readonly />
                    <TextField label="First Name" field="firstName" />
                    <TextField label="Last Name" field="lastName" />
                    <DateField
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
                    <TextField<User>
                        label="Zip Code"
                        getter={(form) =>
                            form.zip.toString().padStart(5, '0').slice(-5)
                        }
                        setter={(form, field) => ({
                            ...form,
                            zip: field
                                .replace(/[^\d]/, '')
                                .padStart(5, '0')
                                .slice(-5),
                        })}
                    />
                    <TextField label="Email" field="emailAddress" />
                    <TextField label="Phone Number" field="phoneNumber" />
                </FormGroup>
            </Form>
        </div>
    )
}
