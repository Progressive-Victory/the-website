'use client'

import {
    CheckboxField,
    DateField,
    Form,
    FormField,
    FormFieldProps,
    FormGroup,
    FormState,
    PhoneField,
    SelectManyField,
    TextField,
} from '@/components/common/forms'
import formFieldStyles from '@/components/common/forms/FormField.module.css'
import { Role, UpdateHistory, User } from '@/contracts/data'
import { dateService } from '@/services'
import { ChangeEvent, useEffect, useState } from 'react'

const membershipCardShipmentOptions = [
    { value: 'not_started', label: 'Not Started' },
    { value: 'card_printed', label: 'Card Printed' },
    { value: 'card_packaged', label: 'Card Packaged' },
    { value: 'card_shipped', label: 'Card Shipped' },
]

const membershipMerchShipmentOptions = [
    { value: 'not_started', label: 'Not Started' },
    { value: 'merch_packaged', label: 'Merch Packaged' },
    { value: 'merch_shipped', label: 'Merch Shipped' },
]

const shirtSizeOptions = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' },
    { value: 'xl', label: 'XL' },
    { value: '2xl', label: '2XL' },
]

const duesMemberOptions = [
    { value: 'not_dues_paying_member', label: 'Not Dues Paying Member' },
    { value: 'dues_paying_member', label: 'Dues Paying Member' },
    { value: 'premium_member', label: 'Premium Member' },
    { value: 'signature_member', label: 'Signature Member' },
    { value: 'inner_circle_member', label: 'Inner Circle Member' },
]

const membershipFulfillmentStatusOptions = [
    { value: 'not_eligible', label: 'Not Eligible' },
    { value: 'roles_received', label: 'Roles Received' },
    { value: 'card_shipped', label: 'Card Shipped' },
    { value: 'merch_shipped', label: 'Merch Shipped' },
    { value: 'benefits_fulfilled', label: 'Benefits Fulfilled' },
    { value: 'fulfillment_issue', label: 'Fulfillment Issue' },
]

interface StaticSelectFieldProps extends Pick<
    FormFieldProps<User, string>,
    'id' | 'label' | 'readonly' | 'dynamic'
> {
    defaultValue: string
    options: { value: string; label: string }[]
}

interface StaticCheckboxFieldProps extends Pick<
    FormFieldProps<User, boolean>,
    'id' | 'label' | 'readonly' | 'dynamic'
> {
    defaultValue: boolean
}

const calcFutureDate = (
    initialTime: Date,
    period: 'weekly' | 'monthly',
    duration: number
) => {
    switch (period) {
        case 'weekly':
            return new Date(
                initialTime.getTime() +
                    new Date(duration * 7 * 24 * 60 * 60 * 1000).getTime()
            )
        case 'monthly':
            initialTime.setMonth(initialTime.getMonth())
            return initialTime
    }
}

const getHasActiveRecurringValue = (form: User): string => {
    const donors = form.donors ?? []
    if (donors.length === 0) return 'No Donor Info'

    const hasActiveRecurring = donors.some((donor) =>
        (donor.contributions ?? []).some(
            (contribution) =>
                contribution.isRecurring &&
                ((contribution.recurringDuration ?? 1) < 0 ||
                    calcFutureDate(
                        contribution.createdAt,
                        contribution.recurringPeriod as 'weekly' | 'monthly',
                        contribution.recurringDuration ?? 1
                    ) > new Date())
        )
    )

    return hasActiveRecurring ? 'Yes' : 'No'
}

function StaticSelectField({
    id,
    label,
    readonly,
    dynamic,
    defaultValue,
    options,
}: StaticSelectFieldProps) {
    const [value, setValue] = useState(defaultValue)

    useEffect(() => {
        if (dynamic?.editing !== true) setValue(defaultValue)
    }, [defaultValue, dynamic?.editing])

    const isReadonly = readonly == true || dynamic?.editing !== true
    const selectedLabel =
        options.find((option) => option.value === value)?.label ?? ''

    const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
        setValue(event.target.value)
    }

    return (
        <FormField<User, string>
            id={id}
            label={label}
            readonly={isReadonly}
            dynamic={dynamic}
        >
            {isReadonly ? (
                <div className={formFieldStyles.readonly}>{selectedLabel}</div>
            ) : (
                <select
                    id={id}
                    name={label}
                    value={value}
                    onChange={handleChange}
                    disabled={dynamic?.saving == true}
                    className={formFieldStyles.textField}
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            )}
        </FormField>
    )
}

function StaticCheckboxField({
    id,
    label,
    readonly,
    dynamic,
    defaultValue,
}: StaticCheckboxFieldProps) {
    const [value, setValue] = useState(defaultValue)

    useEffect(() => {
        if (dynamic?.editing !== true) setValue(defaultValue)
    }, [defaultValue, dynamic?.editing])

    const isReadonly = readonly == true || dynamic?.editing !== true

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.checked)
    }

    return (
        <FormField<User, boolean>
            id={id}
            label={label}
            readonly={isReadonly}
            dynamic={dynamic}
        >
            {isReadonly ? (
                <div className={formFieldStyles.readonly}>
                    {value ? 'Yes' : 'No'}
                </div>
            ) : (
                <div className={formFieldStyles.checkboxField}>
                    <input
                        type="checkbox"
                        id={id}
                        name={label}
                        checked={value}
                        onChange={handleChange}
                        disabled={dynamic?.saving == true}
                    />
                </div>
            )}
        </FormField>
    )
}

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

            <FormGroup title="Membership Fulfillment (Mock)">
                <StaticSelectField
                    label="Membership Card Shipped"
                    defaultValue="not_started"
                    options={membershipCardShipmentOptions}
                />
                <StaticSelectField
                    label="Membership Merch Shipped"
                    defaultValue="not_started"
                    options={membershipMerchShipmentOptions}
                />
                <StaticSelectField
                    label="Shirt Size"
                    defaultValue="medium"
                    options={shirtSizeOptions}
                />
                <StaticSelectField
                    label="Dues Paying Member"
                    defaultValue="not_dues_paying_member"
                    options={duesMemberOptions}
                />
                <StaticSelectField
                    label="Membership Fulfillment Status"
                    defaultValue="not_eligible"
                    options={membershipFulfillmentStatusOptions}
                />
                <StaticCheckboxField
                    label="Name Confirmed"
                    defaultValue={false}
                />
                <StaticCheckboxField
                    label="Address Confirmed"
                    defaultValue={false}
                />
                <TextField<User>
                    label="Has Active Recurring"
                    readonly
                    getter={getHasActiveRecurringValue}
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
