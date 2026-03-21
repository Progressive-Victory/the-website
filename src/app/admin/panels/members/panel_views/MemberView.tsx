'use client'

import styles from './MemberView.module.css'
import { DropdownMenu } from '@/components/common'
import {
    DateField,
    Form,
    FormGroup,
    FormState,
    PhoneField,
    SelectManyField,
    TextField,
} from '@/components/common/forms'
import { InfoBlock } from '@/components/common/panel_block/Block'
import { AddressBlockField } from '@/components/common/panel_block/block_fields/AddressBlockField'
import { BlockField } from '@/components/common/panel_block/block_fields/BlockField'
import { DateBlockField } from '@/components/common/panel_block/block_fields/DateBlockField'
import { NameBlockField } from '@/components/common/panel_block/block_fields/NameBlockField'
import { PhoneBlockField } from '@/components/common/panel_block/block_fields/PhoneBlockField'
import { SelectManyBlockField } from '@/components/common/panel_block/block_fields/SelectManyBlockField'
import { OnboardingStage, Role, UpdateHistory, User } from '@/contracts/data'
import { dateService } from '@/services'
import { useRef } from 'react'

function formatOnboardingStage(stage: OnboardingStage | null | undefined) {
    if (!stage) return null

    return stage
        .split('_')
        .map((word) =>
            word.length ? word.charAt(0).toUpperCase() + word.slice(1) : word
        )
        .join(' ')
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
    const infoGridRef = useRef<HTMLDivElement | null>(null)

    const acceptedAlertsText =
        user.acceptedAlerts == null
            ? 'Not set'
            : user.acceptedAlerts
              ? 'Yes'
              : 'No'
    const verifiedText =
        user.verified == null ? 'Not set' : user.verified ? 'Yes' : 'No'
    const intakeFormStatus = formatOnboardingStage(user.onboardingStage) ?? '-'

    const blockDropDownMenu = () => (
        <>
            <InfoBlock.HideButton />
            <DropdownMenu.Divider />
            <InfoBlock.EditButton />
        </>
    )

    const renderReadonlyMenu = () => <InfoBlock.HideButton />

    return (
        <div className={styles.memberView}>
            <div ref={infoGridRef} className={styles.infoGrid}>
                <InfoBlock
                    title="Contact Info"
                    boundaryRef={infoGridRef}
                    user={user}
                    menu={blockDropDownMenu()}
                    onSave={handleSave}
                >
                    <NameBlockField />
                    <BlockField
                        label="Discord"
                        ariaLabel="Discord info"
                        getter={(u) =>
                            (u.discordUsers ?? [])
                                .map(({ username }) => `@${username}`)
                                .join(', ') || '-'
                        }
                    />
                    <PhoneBlockField
                        label="Phone"
                        ariaLabel="Phone info"
                        getter={(u) => u.phone}
                        setter={(u, v) => ({ ...u, phone: v.trim() || null })}
                    />
                    <BlockField
                        label="Email"
                        ariaLabel="Email info"
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
                    menu={blockDropDownMenu()}
                    onSave={handleSave}
                >
                    <AddressBlockField />
                    <BlockField
                        label="County"
                        ariaLabel="County info"
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
                    menu={blockDropDownMenu()}
                    onSave={handleSave}
                >
                    <DateBlockField
                        label="Date of Birth"
                        ariaLabel="Date of birth info"
                        getter={(u) => u.birthdate}
                        setter={(u, date) => ({ ...u, birthdate: date })}
                        displayFormat="date-long"
                    />
                    <BlockField
                        label="Age"
                        ariaLabel="Age info"
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
                        getter={(u) => u.createdAtUtc}
                        displayFormat="datetime"
                    />
                </InfoBlock>
                <InfoBlock
                    title="Account Status"
                    boundaryRef={infoGridRef}
                    user={user}
                    menu={renderReadonlyMenu()}
                >
                    <BlockField
                        label="Accepted Alerts"
                        ariaLabel="Accepted alerts info"
                        getter={() => acceptedAlertsText}
                    />
                    <BlockField
                        label="Verified"
                        ariaLabel="Verified info"
                        getter={() => verifiedText}
                    />
                    <BlockField
                        label="Intake Form Status"
                        ariaLabel="Intake form status info"
                        getter={() => intakeFormStatus}
                    />
                    <DateBlockField
                        label="Date Intake Done"
                        ariaLabel="Date intake done info"
                        getter={(u) => u.completedIntakeUtc}
                        displayFormat="datetime"
                    />
                    <DateBlockField
                        label="Date Server Joined"
                        ariaLabel="Date server joined info"
                        getter={(u) => u.joinedAtUtc}
                        displayFormat="datetime"
                    />
                </InfoBlock>
                <InfoBlock
                    title="Roles"
                    boundaryRef={infoGridRef}
                    user={user}
                    menu={blockDropDownMenu()}
                    onSave={handleSave}
                    className={styles.infoBlockFullWidth}
                >
                    <SelectManyBlockField
                        options={roleOptions}
                        getter={(u) => (u.roles ?? []).map((r) => r.id)}
                        setter={(u, ids) => ({
                            ...u,
                            roles: Array.from(
                                new Map(
                                    [...(u.roles ?? []), ...roles].map((r) => [
                                        r.id,
                                        r,
                                    ])
                                ).values()
                            ).filter((r) => ids.includes(r.id)),
                        })}
                        boundaryRef={infoGridRef}
                        emptyMessage="No roles assigned"
                    />
                </InfoBlock>
                <InfoBlock
                    title="Aliases"
                    boundaryRef={infoGridRef}
                    user={user}
                    menu={renderReadonlyMenu()}
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
                        label="Discord ID"
                        getter={(form) => form.discordUsers?.[0]?.id}
                        readonly
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
                    <TextField<User>
                        label="Age"
                        readonly
                        getter={(form) =>
                            dateService.isValid(form.birthdate)
                                ? dateService
                                      .getAge(form.birthdate!)
                                      ?.toString()
                                : null
                        }
                    />
                    <DateField
                        label="Account Created"
                        field="createdAtUtc"
                        readonly
                    />
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
                </FormGroup>

                <FormGroup title="Account Status" defaultCollapsed>
                    <TextField<User>
                        label="Accepted Alerts"
                        getter={(form) =>
                            form.acceptedAlerts == null
                                ? 'Not set'
                                : form.acceptedAlerts
                                  ? 'Yes'
                                  : 'No'
                        }
                        readonly
                    />
                    <TextField<User>
                        label="Verified"
                        getter={(form) =>
                            form.verified == null
                                ? 'Not set'
                                : form.verified
                                  ? 'Yes'
                                  : 'No'
                        }
                        readonly
                    />
                    <TextField<User>
                        label="Inake Form Status"
                        getter={(form) =>
                            formatOnboardingStage(form.onboardingStage)
                        }
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
                        getter={(form) =>
                            (form.roles ?? []).map((role) => role.id)
                        }
                        setter={(form, field) => ({
                            ...form,
                            roles:
                                field != null
                                    ? Array.from(
                                          new Map(
                                              [
                                                  ...(form.roles ?? []),
                                                  ...roles,
                                              ].map((role) => [
                                                  role.id.toString(),
                                                  role,
                                              ])
                                          ).values()
                                      ).filter((role) =>
                                          field.some(
                                              (id) =>
                                                  id.toString() ==
                                                  role.id.toString()
                                          )
                                      )
                                    : form.roles,
                        })}
                    />
                </FormGroup>
            </Form>
        </div>
    )
}
