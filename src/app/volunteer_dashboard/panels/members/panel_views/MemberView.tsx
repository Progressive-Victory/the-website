'use client'

import * as Info from '../info'
import styles from '../page.module.css'
import {
    AddList,
    AddressRow,
    DateRow,
    List,
    NameRow,
    PhoneRow,
    PickerRow,
    TextRow,
    ListBreak,
    MultiSelectRow,
    ToggleRow,
} from '@/components/common'
import { Form, FormState } from '@/components/common/forms'
import { pronounOptionsWith } from '@/models'
import { dateService } from '@/services'
import { useFetch } from '@/util/hooks'
import { skipToken, useQuery } from '@tanstack/react-query'
import {
    Location,
    Position,
    Role,
    ShirtSize,
    UpdateHistory,
    User,
} from 'pv-contracts/data'
import { zDiscordUserIsInServerResponse } from 'pv-contracts/responses'
import type { ComponentType } from 'react'

const shirtSizeOptions = [
    { value: '', label: 'None' },
    { value: 'XS', label: 'Extra Small' },
    { value: 'S', label: 'Small' },
    { value: 'M', label: 'Medium' },
    { value: 'L', label: 'Large' },
    { value: 'XL', label: 'Extra Large' },
    { value: '2XL', label: 'Double XL' },
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

const hasActiveRecurring = (form: User): boolean =>
    (form.donors ?? []).some((donor) =>
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

const toListItem = ({ id, name }: { id: number; name: string }) => ({
    id,
    label: name,
})

const accountDateFormat: Intl.DateTimeFormatOptions = {
    dateStyle: 'long',
    timeStyle: 'medium',
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
    /** Every position, offered by the Positions add list. */
    positions: Position[]
    location?: Location | null
    invalidZip?: string | null

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
    positions,
    location,
    invalidZip,
    makeFormTitle,
    handleSave,
}: MemberViewProps) {
    const availablePronouns = pronounOptionsWith(
        (selectedHistory ?? user).preferredPronouns
    )

    const { ready, onGet } = useFetch()
    const discordUserId = user.discordUsers?.[0]?.id ?? null
    const isInServerQuery = useQuery({
        queryKey: [`/discordUsers/${discordUserId}/isInServer`],
        queryFn:
            ready && discordUserId != null
                ? ({ signal }) =>
                      onGet(
                          '/discordUsers/:discordUserId/isInServer',
                          zDiscordUserIsInServerResponse,
                          { params: { discordUserId }, signal }
                      )
                : skipToken,
    })

    const infoDetails = (
        Details: ComponentType<Info.InfoProps>,
        value?: string
    ) =>
        function InfoDetails({ closeDropdown }: { closeDropdown: () => void }) {
            return <Details user={user} value={value} onSave={closeDropdown} />
        }

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
            <List title="Member Details">
                <NameRow label="Name" details={infoDetails(Info.NameInfo)} />
                <PickerRow
                    label="Pronouns"
                    getter={(form: User) => form.preferredPronouns ?? ''}
                    setter={(form: User, value) => ({
                        ...form,
                        preferredPronouns: value ? String(value) : null,
                    })}
                    options={availablePronouns}
                    details={infoDetails(Info.PronounsInfo)}
                />
                <ListBreak />
                <TextRow
                    label="Discord"
                    getter={(form: User) =>
                        (form.discordUsers ?? [])
                            .map(({ username }) => `@${username}`)
                            .join(', ')
                    }
                    readOnly
                    details={infoDetails(Info.DiscordInfo)}
                />
                <PhoneRow
                    label="Phone"
                    field="phone"
                    indicator="required"
                    details={infoDetails(Info.PhoneInfo)}
                />
                <TextRow
                    label="Email"
                    field="email"
                    indicator="required"
                    details={infoDetails(Info.EmailInfo)}
                />
                <ListBreak />
                <AddressRow
                    label="Address"
                    indicator="required"
                    showCounty
                    location={location}
                    invalidZip={invalidZip}
                    getter={(form: User) => form.address}
                    setter={(form: User, address) => ({
                        ...form,
                        address: { ...form.address, ...address },
                    })}
                    validator={(address) =>
                        !!address?.state?.trim() || address?.zip?.length === 5
                    }
                    details={infoDetails(Info.AddressInfo)}
                />
                <ListBreak />
                <DateRow
                    label="Date of Birth"
                    getter={(form: User) =>
                        dateService.fromISODateString(form.birthdate)
                    }
                    setter={(form: User, date) => ({
                        ...form,
                        birthdate: date,
                    })}
                    details={infoDetails(Info.DateOfBirthInfo)}
                />
                <TextRow
                    label="Age"
                    getter={(form: User) =>
                        dateService.isValid(form.birthdate)
                            ? dateService.getAge(form.birthdate!)?.toString()
                            : null
                    }
                    readOnly
                    details={infoDetails(Info.AgeInfo)}
                />
                <ListBreak />
                <DateRow
                    label="Account Created"
                    field="createdAtUtc"
                    dateFormat={accountDateFormat}
                    readOnly
                    details={infoDetails(Info.AccountCreatedInfo)}
                />
                <ListBreak />
                <MultiSelectRow
                    label="Aliases"
                    field="aliases"
                    indicator="unsupported"
                    details={infoDetails(Info.AliasesInfo)}
                />
            </List>

            <List title="Discord Information">
                <TextRow
                    label="Discord Username"
                    getter={(form: User) =>
                        (form.discordUsers ?? [])
                            .map(({ username }) => `@${username}`)
                            .join(', ')
                    }
                    readOnly
                />
                <TextRow
                    label="Server Nickname"
                    indicator="unsupported"
                    readOnly
                />
                <ListBreak />
                <TextRow
                    label="Discord ID"
                    getter={(form: User) => form.discordUsers?.[0]?.id}
                    readOnly
                />
                <TextRow
                    label="Discord Email"
                    getter={(form: User) => form.discordUsers?.[0]?.email}
                    readOnly
                />
                <ListBreak />
                <ToggleRow
                    label="Currently In Server"
                    value={isInServerQuery.data?.isInServer}
                    readOnly
                />
                <DateRow
                    label="Joined Server"
                    field="joinedAtUtc"
                    dateFormat={accountDateFormat}
                    readOnly
                />
            </List>

            <List title="Membership">
                <ToggleRow
                    label="Dues Paying Member"
                    field="duesPayingMember"
                    readOnly
                />
                <ToggleRow
                    label="Has Active Recurring"
                    getter={hasActiveRecurring}
                    readOnly
                />
                <ListBreak />
                <ToggleRow
                    label="Qualifies for Membership Benefits"
                    field="membershipBenefitEligible"
                    readOnly
                />
                <PickerRow
                    label="Shirt Size"
                    getter={(form: User) => form.shirtSize ?? ''}
                    setter={(form: User, value) => ({
                        ...form,
                        shirtSize: value ? (value as ShirtSize) : null,
                    })}
                    options={shirtSizeOptions}
                />
            </List>

            <List title="Account Status" defaultCollapsed>
                <ToggleRow label="Verified" field="verified" readOnly />
                <TextRow
                    label="Onboarding Stage"
                    field="onboardingStage"
                    readOnly
                />{' '}
                <ListBreak />
                <DateRow
                    label="Account Created"
                    field="createdAtUtc"
                    dateFormat={accountDateFormat}
                    readOnly
                />
                <DateRow
                    label="Completed Signup"
                    field="completedIntakeUtc"
                    dateFormat={accountDateFormat}
                    readOnly
                />
                <DateRow
                    label="Joined Discord Server"
                    field="joinedAtUtc"
                    dateFormat={accountDateFormat}
                    readOnly
                />
                <ListBreak />
                <ToggleRow
                    label="Accepted Alerts"
                    field="acceptedAlerts"
                    readOnly
                />
            </List>

            <AddList
                title="Positions"
                addLabel="Add Position"
                emptyLabel="No positions"
                pickerTitle="Add Position"
                pickerSubtitle="Search for a position to assign this member to."
                options={positions
                    .filter(
                        (position) =>
                            position.seats == null ||
                            position.userIds.length < position.seats ||
                            position.userIds.includes(user.id)
                    )
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((position) => ({
                        ...toListItem(position),
                        description:
                            position.seats == null
                                ? `${position.userIds.length} assigned`
                                : `${position.userIds.length} of ${position.seats} seats filled`,
                    }))}
                getter={(form: User) =>
                    (form.positions ?? []).map((position) => ({
                        ...toListItem(position),
                        href: `/volunteer_dashboard/panels/positions?positionId=${position.id}`,
                    }))
                }
                setter={(form: User, items) => ({
                    ...form,
                    positions: items
                        .map(
                            (item) =>
                                positions.find((p) => p.id === item.id) ??
                                form.positions?.find((p) => p.id === item.id)
                        )
                        .filter((position) => position != null),
                })}
            />
            {/* Commented Out Delibrately Because Roles Are Not Fully Depricated */}
            {/* <AddList
                title="Roles"
                addLabel="Add Role"
                emptyLabel="No roles"
                pickerTitle="Add Role"
                pickerSubtitle="Search for a role to give this member."
                options={roles.map(toListItem)}
                getter={(form: User) => (form.roles ?? []).map(toListItem)}
                setter={(form: User, items) => ({
                    ...form,
                    roles: items
                        .map(
                            (item) =>
                                roles.find((r) => r.id === item.id) ??
                                form.roles?.find((r) => r.id === item.id)
                        )
                        .filter((role) => role != null),
                })}
            /> */}
        </Form>
    )
}
