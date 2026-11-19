'use client'

import styles from './MemberView.module.css'
import {
    AddList,
    AddressRow,
    DateRow,
    DropdownMenu,
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
import { InfoBlock } from '@/components/common/panel_block/Block'
import { AddressBlockField } from '@/components/common/panel_block/block_fields/AddressBlockField'
import { BlockField } from '@/components/common/panel_block/block_fields/BlockField'
import { DateBlockField } from '@/components/common/panel_block/block_fields/DateBlockField'
import { NameBlockField } from '@/components/common/panel_block/block_fields/NameBlockField'
import { PhoneBlockField } from '@/components/common/panel_block/block_fields/PhoneBlockField'
import { SelectManyBlockField } from '@/components/common/panel_block/block_fields/SelectManyBlockField'
import { pronounOptionsWith } from '@/models'
import { dateService } from '@/services'
import { cn } from '@/util'
import {
    Location,
    OnboardingStage,
    Position,
    Role,
    ShirtSize,
    UpdateHistory,
    User,
} from 'pv-contracts/data'
import { useRef } from 'react'

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

const yesNo = (value: boolean | null | undefined) =>
    value == null ? 'Not set' : value ? 'Yes' : 'No'

function formatOnboardingStage(stage: OnboardingStage | null | undefined) {
    if (!stage) return null

    return stage
        .split('_')
        .map((word) =>
            word.length ? word.charAt(0).toUpperCase() + word.slice(1) : word
        )
        .join(' ')
}

interface SkelBlockSpec {
    rows?: [labelW: string, valueW: string][]
    pills?: string[]
    fullWidth?: boolean
}

const SKEL_BLOCKS: SkelBlockSpec[] = [
    {
        rows: [
            ['3rem', '5rem'],
            ['4rem', '5.5rem'],
            ['3rem', '6.5rem'],
            ['3rem', '8rem'],
        ],
    },
    {
        rows: [
            ['4rem', '7rem'],
            ['3.5rem', '3rem'],
        ],
    },
    {
        rows: [
            ['5.5rem', '6rem'],
            ['2rem', '1.5rem'],
            ['6rem', '7rem'],
        ],
    },
    {
        rows: [
            ['6rem', '2rem'],
            ['3.5rem', '2rem'],
            ['6.5rem', '3.5rem'],
            ['6rem', '7rem'],
            ['6.5rem', '7rem'],
        ],
    },
    { fullWidth: true, pills: ['4.5rem', '3.5rem', '5.5rem', '3rem', '4rem'] },
    { fullWidth: true, pills: ['3.5rem', '4.5rem'] },
]

function SkelInfoBlock({ spec }: { spec: SkelBlockSpec }) {
    return (
        <div
            className={cn(
                styles.skelBlock,
                spec.fullWidth && styles.infoBlockFullWidth
            )}
        >
            <div className={styles.skelBlockHeader}>
                <div className={cn(styles.skelShim, styles.skelBlockTitle)} />
                <div className={cn(styles.skelShim, styles.skelBlockIcon)} />
            </div>
            <div className={styles.skelBlockBody}>
                {spec.rows?.map(([labelW, valueW], i) => (
                    <div key={i} className={styles.skelFieldRow}>
                        <div
                            className={cn(
                                styles.skelShim,
                                styles.skelFieldShim
                            )}
                            style={{ width: labelW }}
                        />
                        <div
                            className={cn(
                                styles.skelShim,
                                styles.skelFieldShim
                            )}
                            style={{ width: valueW }}
                        />
                    </div>
                ))}
                {spec.pills && (
                    <div className={styles.skelPillsWrap}>
                        {spec.pills.map((w, i) => (
                            <div
                                key={i}
                                className={cn(
                                    styles.skelShim,
                                    styles.skelPillShim
                                )}
                                style={{ width: w }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export function MemberViewSkeleton() {
    return (
        <div className={styles.memberView}>
            <div className={styles.skelHeader}>
                <div className={styles.skelBannerCover} />
                <div className={styles.skelHeaderCard}>
                    <div className={styles.skelAvatarRow}>
                        <div className={styles.skelAvatar} />
                        <div className={styles.skelNameCol}>
                            <div
                                className={cn(
                                    styles.skelShim,
                                    styles.skelUserName
                                )}
                            />
                            <div
                                className={cn(
                                    styles.skelShim,
                                    styles.skelUserHandle
                                )}
                            />
                        </div>
                    </div>
                    <div className={styles.skelRolePillRow}>
                        {['4.5rem', '3.5rem', '5rem'].map((w, i) => (
                            <div
                                key={i}
                                className={cn(
                                    styles.skelShim,
                                    styles.skelPillShim
                                )}
                                style={{ width: w }}
                            />
                        ))}
                    </div>
                    <div className={styles.skelTabRow}>
                        {[0, 1, 2].map((i) => (
                            <div
                                key={i}
                                className={cn(
                                    styles.skelShim,
                                    styles.skelTabShim
                                )}
                            />
                        ))}
                    </div>
                </div>
            </div>
            <div className={styles.skelContent}>
                <div className={styles.infoGrid}>
                    {SKEL_BLOCKS.map((spec, i) => (
                        <SkelInfoBlock key={i} spec={spec} />
                    ))}
                </div>
            </div>
        </div>
    )
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
    const infoGridRef = useRef<HTMLDivElement | null>(null)

    const positionOptions = positions.map(({ id, name }) => ({
        value: id,
        label: name,
    }))

    const editableMenu = (
        <>
            <InfoBlock.HideButton />
            <DropdownMenu.Divider />
            <InfoBlock.EditButton />
        </>
    )

    const readonlyMenu = <InfoBlock.HideButton />

    return (
        <div className={styles.memberView}>
            <div ref={infoGridRef} className={styles.infoGrid}>
                <InfoBlock
                    title="Contact Info"
                    boundaryRef={infoGridRef}
                    user={user}
                    menu={editableMenu}
                    onSave={handleSave}
                >
                    <NameBlockField description="The member's registered first and last name as stored in their profile." />
                    <BlockField
                        label="Discord"
                        ariaLabel="Discord info"
                        description="Discord account(s) linked to this member. Used for server access, identification, and outreach."
                        getter={(u) =>
                            (u.discordUsers ?? [])
                                .map(({ username }) => `@${username}`)
                                .join(', ') || '-'
                        }
                    >
                        <DropdownMenu.InfoSection>
                            {(user.discordUsers ?? []).map(({ id }) => (
                                <DropdownMenu.InfoRow
                                    key={id}
                                    label="Discord ID"
                                    value={id}
                                />
                            ))}
                        </DropdownMenu.InfoSection>
                    </BlockField>
                    <PhoneBlockField
                        label="Phone"
                        ariaLabel="Phone info"
                        description="Primary phone number on file. Used for text alerts and direct organizer contact."
                        getter={(u) => u.phone}
                        setter={(u, v) => ({ ...u, phone: v.trim() || null })}
                    />
                    <BlockField
                        label="Email"
                        ariaLabel="Email info"
                        description="Email address used for notifications, outreach, and account access."
                        getter={(u) => u.email?.trim() ?? '-'}
                        editGetter={(u) => u.email ?? ''}
                        setter={(u, v) => ({ ...u, email: v.trim() || null })}
                        inputType="email"
                    />
                </InfoBlock>
                <InfoBlock
                    title="Address Info"
                    boundaryRef={infoGridRef}
                    user={user}
                    menu={editableMenu}
                    onSave={handleSave}
                >
                    <AddressBlockField />
                    <BlockField
                        label="County"
                        ariaLabel="County info"
                        description="The member's county of residence within their state, used for district-level targeting."
                        getter={(u) => u.address.county ?? undefined}
                        editGetter={(u) => u.address.county ?? ''}
                        setter={(u, v) => ({
                            ...u,
                            address: { ...u.address, county: v.trim() || null },
                        })}
                    />
                </InfoBlock>
                <InfoBlock
                    title="Personal Info"
                    boundaryRef={infoGridRef}
                    user={user}
                    menu={editableMenu}
                    onSave={handleSave}
                >
                    <DateBlockField
                        label="Date of Birth"
                        ariaLabel="Date of birth info"
                        description="Member's date of birth. Used to verify eligibility and calculate age."
                        getter={(u) => u.birthdate}
                        setter={(u, date) => ({ ...u, birthdate: date })}
                        displayFormat="date-long"
                    />
                    <BlockField
                        label="Age"
                        ariaLabel="Age info"
                        description="Derived from date of birth. Not stored independently — updates automatically."
                        getter={(u) =>
                            dateService.isValid(u.birthdate)
                                ? (dateService
                                      .getAge(u.birthdate!)
                                      ?.toString() ?? '-')
                                : '-'
                        }
                    />
                    <DateBlockField
                        label="Account Created"
                        ariaLabel="Account created info"
                        description="Timestamp when this account was first registered in the system."
                        getter={(u) => u.createdAtUtc}
                        displayFormat="datetime"
                    />
                </InfoBlock>
                <InfoBlock
                    title="Account Status"
                    boundaryRef={infoGridRef}
                    user={user}
                    menu={readonlyMenu}
                >
                    <BlockField
                        label="Accepted Alerts"
                        ariaLabel="Accepted alerts info"
                        description="Whether this member has opted in to receive text and email alerts from the organization."
                        getter={(u) => yesNo(u.acceptedAlerts)}
                    />
                    <BlockField
                        label="Verified"
                        ariaLabel="Verified info"
                        description="Indicates whether an organizer has manually reviewed and verified this account."
                        getter={(u) => yesNo(u.verified)}
                    />
                    <BlockField
                        label="Intake Form Status"
                        ariaLabel="Intake form status info"
                        description="The member's current stage within the onboarding intake flow."
                        getter={(u) =>
                            formatOnboardingStage(u.onboardingStage) ?? '-'
                        }
                    />
                    <DateBlockField
                        label="Date Intake Done"
                        ariaLabel="Date intake done info"
                        description="Timestamp when the member completed their onboarding intake form."
                        getter={(u) => u.completedIntakeUtc}
                        displayFormat="datetime"
                    />
                    <DateBlockField
                        label="Date Server Joined"
                        ariaLabel="Date server joined info"
                        description="Timestamp when the member joined the organization's Discord server."
                        getter={(u) => u.joinedAtUtc}
                        displayFormat="datetime"
                    />
                </InfoBlock>
                <InfoBlock
                    title="Positions"
                    boundaryRef={infoGridRef}
                    user={user}
                    menu={editableMenu}
                    onSave={handleSave}
                    className={styles.infoBlockFullWidth}
                >
                    <SelectManyBlockField
                        options={positionOptions}
                        getter={(u) => (u.positions ?? []).map((p) => p.id)}
                        setter={(u, ids) => ({
                            ...u,
                            positions: ids
                                .map(
                                    (id) =>
                                        positions.find((p) => p.id === id) ??
                                        u.positions?.find((p) => p.id === id)
                                )
                                .filter((position) => position != null),
                        })}
                        boundaryRef={infoGridRef}
                        emptyMessage="No positions"
                    />
                </InfoBlock>
                <InfoBlock
                    title="Aliases"
                    boundaryRef={infoGridRef}
                    user={user}
                    menu={readonlyMenu}
                    className={styles.infoBlockFullWidth}
                >
                    <SelectManyBlockField<string>
                        options={(user.aliases ?? []).map((a) => ({
                            value: a,
                            label: a,
                        }))}
                        getter={(u) => u.aliases ?? []}
                        setter={(u, aliases) => ({ ...u, aliases })}
                        boundaryRef={infoGridRef}
                        emptyMessage="No aliases"
                    />
                </InfoBlock>
            </div>
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
                    <NameRow label="Name" />
                    <PickerRow
                        label="Pronouns"
                        getter={(form: User) => form.preferredPronouns ?? ''}
                        setter={(form: User, value) => ({
                            ...form,
                            preferredPronouns: value ? String(value) : null,
                        })}
                        options={availablePronouns}
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
                    />
                    <PhoneRow
                        label="Phone"
                        field="phone"
                        indicator="required"
                    />
                    <TextRow label="Email" field="email" indicator="required" />
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
                            !!address?.state?.trim() ||
                            address?.zip?.length === 5
                        }
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
                    />
                    <TextRow
                        label="Age"
                        getter={(form: User) =>
                            dateService.isValid(form.birthdate)
                                ? dateService
                                      .getAge(form.birthdate!)
                                      ?.toString()
                                : null
                        }
                        readOnly
                    />
                    <ListBreak />
                    <DateRow
                        label="Account Created"
                        field="createdAtUtc"
                        dateFormat={accountDateFormat}
                        readOnly
                    />
                    <ListBreak />
                    <MultiSelectRow
                        label="Aliases"
                        field="aliases"
                        indicator="unsupported"
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
                        (form.positions ?? []).map(toListItem)
                    }
                    setter={(form: User, items) => ({
                        ...form,
                        positions: items
                            .map(
                                (item) =>
                                    positions.find((p) => p.id === item.id) ??
                                    form.positions?.find(
                                        (p) => p.id === item.id
                                    )
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
        </div>
    )
}
