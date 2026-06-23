'use client'

import {
    CheckboxField,
    DateField,
    DropDownField,
    Form,
    FormGroup,
    FormState,
    PhoneField,
    SelectManyField,
    TextField,
} from '@/components/common/forms'
import { Role, UpdateHistory, User } from '@/contracts/data'
import { dateService } from '@/services'

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
export interface MemberViewProps {
    selectedId: number
    user: User
    selectedHistory: UpdateHistory<User> | null

    setFormState?: (next: FormState<User> | null) => void

    saving: boolean
    editing: boolean
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
    editing,
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
                {editing ? (
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
                {/* Needs to be like this. Fragments break it. Check PR #436 to see previous testing */}
                {editing && <TextField label="Last Name" field="lastName" />}
                <DateField<User>
                    label="Date of Birth"
                    getter={(form) =>
                        dateService.fromISODateString(form.birthdate)
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
                <DropDownField<User>
                    label="Membership Card Shipped"
                    field="membershipCardStatus"
                    options={membershipCardShipmentOptions}
                />
                <DropDownField<User>
                    label="Membership Merch Shipped"
                    field="membershipMerchStatus"
                    options={membershipMerchShipmentOptions}
                />
                <DropDownField<User>
                    label="Shirt Size"
                    field="shirtSize"
                    options={shirtSizeOptions}
                />
                <CheckboxField<User>
                    label="Dues Paying Member"
                    field="duesPayingMember"
                />
                <DropDownField<User>
                    label="Membership Fulfillment Status"
                    field="membershipFulfillmentOptions"
                    options={membershipFulfillmentStatusOptions}
                />
                <CheckboxField label="Name Confirmed" field="nameConfirmed" />
                <CheckboxField
                    label="Address Confirmed"
                    field="addressConfirmed"
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
