'use client'

import {
    CheckboxField,
    DateField,
    Form,
    FormGroup,
    FormState,
    PhoneField,
    SelectManyField,
    TextField,
} from '@/components/common/forms'
import { Role, UpdateHistory, User } from '@/contracts/data'
import { dateService } from '@/services'

export interface MemberViewProps {
    selectedId: number
    user: User
    selectedHistory: UpdateHistory<User> | null

    setFormState?: (next: FormState<User> | null) => void

    saving: boolean
    isInvalid: boolean
    roles: Role[]
    roleOptions: { value: number; label: string }[]

    makeFormTitle: (user: User) => string
    handleSave?: (user: User) => void
}

export function MemberView({
    selectedId,
    user,
    selectedHistory,
    setFormState,
    saving,
    isInvalid,
    roles,
    roleOptions,
    makeFormTitle,
    handleSave,
}: MemberViewProps) {
    return (
        <Form<User>
            key={selectedId}
            form={selectedHistory ?? user}
            title={makeFormTitle(user)}
            readonly={selectedHistory != null}
            saving={saving}
            isInvalid={isInvalid}
            onUpdate={setFormState}
            onSave={handleSave}
        >
            <FormGroup title="Account Information">
                <TextField<User>
                    label="Discord Username"
                    getter={(form) =>
                        (form.discordUsers ?? [])
                            ?.map(({ username }) => `@${username}`)
                            .join(', ')
                    }
                    readonly
                />
                <TextField<User>
                    label="Discord Id"
                    getter={(form) => form.discordUsers?.[0]?.id}
                    readonly
                />
                <TextField
                    label="Email"
                    field="email"
                    autocomplete="email"
                    required
                />
                <PhoneField label="Phone Number" field="phone" required />
                <TextField
                    label="Preferred Name"
                    field="preferredName"
                    deprecated
                />
                <TextField label="First Name" field="firstName" />
                <TextField label="Last Name" field="lastName" />
                <DateField<User>
                    label="Date of Birth"
                    getter={(form) =>
                        dateService.isValid(form.birthdate)
                            ? new Date(
                                  dateService.toISODateString(form.birthdate)!
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
                    label="Age"
                    readonly
                    getter={(form) =>
                        dateService.isValid(form.birthdate)
                            ? dateService.getAge(form.birthdate!)?.toString()
                            : null
                    }
                />
                <DateField label="Date Created" field="createdAtUtc" readonly />
                <SelectManyField<User>
                    label="Aliases"
                    field="aliases"
                    options={(user.aliases ?? []).map((alias) => ({
                        value: alias,
                        label: alias,
                    }))}
                    readonly
                />
            </FormGroup>

            <FormGroup title="Address">
                <TextField<User>
                    label="Address Line 1"
                    getter={(form) => form.address.addressLine1}
                    setter={(form, field) => ({
                        ...form,
                        address: {
                            ...form.address,
                            addressLine1: field?.slice(0, 100) ?? null,
                        },
                    })}
                />
                <TextField<User>
                    label="Address Line 2"
                    getter={(form) => form.address.addressLine2}
                    setter={(form, field) => ({
                        ...form,
                        address: {
                            ...form.address,
                            addressLine2: field?.slice(0, 100) ?? null,
                        },
                    })}
                />
                <TextField<User>
                    label="City"
                    getter={(form) => form.address.city}
                    setter={(form, field) => ({
                        ...form,
                        address: {
                            ...form.address,
                            city: field?.slice(0, 50) ?? null,
                        },
                    })}
                />
                <TextField<User>
                    label="County"
                    getter={(form) => form.address.county}
                    setter={(form, field) => ({
                        ...form,
                        address: {
                            ...form.address,
                            county: field?.slice(0, 50) ?? null,
                        },
                    })}
                />
                <TextField<User>
                    label="State"
                    getter={(form) => form.address.state}
                    setter={(form, field) => ({
                        ...form,
                        address: {
                            ...form.address,
                            state:
                                field?.trim()?.toUpperCase()?.slice(0, 2) ??
                                null,
                        },
                    })}
                    validator={(field) => field?.length == 2}
                />
                <TextField<User>
                    label="Zip Code"
                    getter={(form) => form.address.zip}
                    setter={(form, field) => ({
                        ...form,
                        address: {
                            ...form.address,
                            zip:
                                field
                                    ?.replace(/[^\d]/, '')
                                    ?.padStart(5, '0')
                                    ?.slice(-5) ?? null,
                        },
                    })}
                    validator={(field) => field?.length == 5}
                />
            </FormGroup>

            <FormGroup title="Account Status" defaultCollapsed>
                <CheckboxField
                    label="Accepted Alerts"
                    field="acceptedAlerts"
                    readonly
                />
                <CheckboxField label="Verified" field="verified" readonly />
                <TextField
                    label="Onboarding Stage"
                    field="onboardingStage"
                    readonly
                />
                <DateField
                    label="Date Intake Done"
                    field="completedIntakeUtc"
                    readonly
                />
                <DateField
                    label="Date Server Joined"
                    field="joinedAtUtc"
                    readonly
                />
            </FormGroup>

            <FormGroup title="Roles">
                <SelectManyField<User>
                    label="Roles"
                    options={roleOptions}
                    getter={(form) => (form.roles ?? []).map((role) => role.id)}
                    setter={(form, field) => ({
                        ...form,
                        roles:
                            field != null
                                ? roles.filter((role) =>
                                      field.includes(role.id)
                                  )
                                : form.roles,
                    })}
                />
            </FormGroup>
        </Form>
    )
}
