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
    useConfigure,
} from '@/components/common/forms'
import formFieldStyles from '@/components/common/forms/FormField.module.css'
import {
    MembershipDeliverableStatus,
    Role,
    UpdateHistory,
    User,
} from '@/contracts/data'
import { dateService } from '@/services'
import { pascalToNormal } from '@/util'
import { ChangeEvent, useCallback, useEffect, useState } from 'react'

const membershipCardShipmentOptions = [
    { value: 0, label: 'Not Eligible' },
    { value: 1, label: 'Not Started' },
    { value: 2, label: 'Printed' },
    { value: 3, label: 'In Transit' },
    { value: 4, label: 'Recieved' },
    { value: 5, label: 'Returned' },
]

const membershipMerchShipmentOptions = [
    { value: 0, label: 'Not Eligible' },
    { value: 1, label: 'Not Started' },
    { value: 2, label: 'Printed' },
    { value: 3, label: 'In Transit' },
    { value: 4, label: 'Recieved' },
    { value: 5, label: 'Returned' },
]

const shirtSizeOptions = [
    { value: 'XS', label: 'Extra Small' },
    { value: 'S', label: 'Small' },
    { value: 'M', label: 'Medium' },
    { value: 'L', label: 'Large' },
    { value: 'XL', label: 'Extra Large' },
    { value: '2XL', label: 'Double XL' },
]

const membershipFulfillmentStatusOptions = [
    { value: 0, label: 'Not Eligible' },
    { value: 1, label: 'Not Fulfilled' },
    { value: 2, label: 'Fulfilled' },
]

interface StaticSelectFieldProps<T> extends FormFieldProps<T, number> {
    defaultValue: string | number
    options: { value: string | number; label: string }[]
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

function StaticSelectField<T>(props: StaticSelectFieldProps<T>) {
    const { getter, onChange, readonly } = useConfigure(
        props,
        useCallback(
            (field: string | number | null | undefined) =>
                !props.required || !!field,
            [props.required]
        )
    )

    const value = getter(props.dynamic!.form) ?? 0

    const isReadonly = readonly == true || props.dynamic?.editing !== true
    const selectedLabel =
        props.options.find((option) => option.value === value)?.label ?? ''

    const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
        onChange(+event.target.value)
    }

    return (
        <FormField {...props}>
            {isReadonly ? (
                <div className={formFieldStyles.readonly}>{selectedLabel}</div>
            ) : (
                <select
                    id={props?.id}
                    name={props.label}
                    value={value}
                    onChange={handleChange}
                    disabled={props.dynamic?.saving == true}
                    className={formFieldStyles.textField}
                >
                    {props.options.map((option) => (
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
    useEffect(() =>
        console.log(
            pascalToNormal(
                MembershipDeliverableStatus[
                    MembershipDeliverableStatus.NotStarted
                ]
            )
        )
    )
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
                <StaticSelectField<User>
                    label="Membership Card Shipped"
                    defaultValue={0}
                    getter={(form) => form.membershipCardStatus}
                    setter={(form, field) => ({
                        ...form,
                        membershipCardStatus: field,
                    })}
                    options={membershipCardShipmentOptions}
                />
                <StaticSelectField
                    label="Membership Merch Shipped"
                    defaultValue={0}
                    options={membershipMerchShipmentOptions}
                />
                <StaticSelectField
                    label="Shirt Size"
                    defaultValue="M"
                    options={shirtSizeOptions}
                />
                <StaticCheckboxField
                    label="Dues Paying Member"
                    defaultValue={false}
                />
                <StaticSelectField
                    label="Membership Fulfillment Status"
                    defaultValue={0}
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
