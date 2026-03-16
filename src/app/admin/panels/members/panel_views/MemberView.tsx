'use client'

import historyStyles from './HistoryView.module.css'

import { HoverTooltip } from '@/components/common'
import {
    DynamicFormFieldProps,
    FormField,
    DateField,
    Form,
    FormGroup,
    FormState,
    PhoneField,
    SelectManyField,
    TextField,
} from '@/components/common/forms'
import { OnboardingStage, Role, UpdateHistory, User } from '@/contracts/data'
import { dateService } from '@/services'

const ONBOARDING_STAGE_CONTENT: Record<
    OnboardingStage,
    { label: string; description: string }
> = {
    [OnboardingStage.NOT_STARTED]: {
        label: 'Signed In With Discord',
        description: "User has connected their Discord Account to PV, but has not begun the intake form.",
    },
    [OnboardingStage.AWAITING_VERIFY]: {
        label: 'Not Verified',
        description:
            'User has either not completed the intake form or has yet to verify their phone number.',
    },
    [OnboardingStage.VERIFIED]: {
        label: 'Intake Form Complete',
        description:
            'User has completed the intake form and verified their phone number.',
    },
    [OnboardingStage.UNDERAGE]: {
        label: 'Underage',
        description:
            'User is under 18 and currently not eligible to join the server.',
    },
    [OnboardingStage.JOINED]: {
        label: 'Joined Discord',
        description: 'User has successfully completed the intake form and joined the server.',
    },
}

const ONBOARDING_STAGE_LABEL_TOOLTIP = [
    'Available stages:',
    ...Object.entries(ONBOARDING_STAGE_CONTENT).map(
        ([, details]) => `${details.label}: ${details.description}`
    ),
].join('\n')

interface ReadonlyAddressFieldProps {
    id?: string
    dynamic?: DynamicFormFieldProps<User>
}

function ReadonlyAddressField({ id, dynamic }: ReadonlyAddressFieldProps) {
    const editing = dynamic?.editing == true
    if (editing) return null

    const address = dynamic?.form.address
    const addressLine1 = address?.addressLine1?.trim()
    const addressLine2 = address?.addressLine2?.trim()
    const city = address?.city?.trim()
    const state = address?.state?.trim()
    const zip = address?.zip?.trim()

    const line2 = [city, state].filter(Boolean).join(', ')
    const cityStateZip = [line2, zip].filter(Boolean).join(' ')
    const lines = [addressLine1, addressLine2, cityStateZip].filter(Boolean)

    return (
        <FormField<User, unknown>
            id={id}
            label="Full Address"
            dynamic={dynamic}
        >
            <div>
                {lines.length ? (
                    lines.map((line, index) => (
                        <div key={`${line}-${index}`}>{line}</div>
                    ))
                ) : (
                    <span>-</span>
                )}
            </div>
        </FormField>
    )
}

interface EditableAddressFieldsProps {
    dynamic?: DynamicFormFieldProps<User>
}

interface PreferredNameFieldProps {
    dynamic?: DynamicFormFieldProps<User>
}

interface NameFieldsProps {
    id?: string
    dynamic?: DynamicFormFieldProps<User>
}

interface OnboardingStageFieldProps {
    id?: string
    dynamic?: DynamicFormFieldProps<User>
}

interface DiscordUsernameFieldProps {
    id?: string
    dynamic?: DynamicFormFieldProps<User>
}

function PreferredNameField({ dynamic }: PreferredNameFieldProps) {
    const preferredName = dynamic?.form.preferredName?.trim()

    if (!preferredName) return null

    const textDynamic =
        dynamic as
            | DynamicFormFieldProps<User, string | null | undefined>
            | undefined

    return (
        <TextField<User>
            id="preferred-name"
            label="Preferred Name"
            field="preferredName"
            deprecated
            dynamic={textDynamic}
        />
    )
}

function NameFields({ id, dynamic }: NameFieldsProps) {
    const editing = dynamic?.editing == true

    if (!editing) {
        const firstName = dynamic?.form.firstName?.trim()
        const lastName = dynamic?.form.lastName?.trim()
        const fullName = [firstName, lastName].filter(Boolean).join(' ')

        return (
            <FormField<User, unknown> id={id} label="Full Name" dynamic={dynamic}>
                <div>{fullName || '-'}</div>
            </FormField>
        )
    }

    const textDynamic =
        dynamic as
            | DynamicFormFieldProps<User, string | null | undefined>
            | undefined

    return (
        <>
            <TextField
                id="first-name"
                label="First Name"
                field="firstName"
                dynamic={textDynamic}
            />
            <TextField
                id="last-name"
                label="Last Name"
                field="lastName"
                dynamic={textDynamic}
            />
        </>
    )
}

function OnboardingStageField({ id, dynamic }: OnboardingStageFieldProps) {
    const stage = dynamic?.form.onboardingStage ?? null
    const details = stage ? ONBOARDING_STAGE_CONTENT[stage] : null
    const value = details?.label ?? '-'
    const description = details?.description ?? 'No onboarding stage set.'

    return (
        <FormField<User, unknown>
            id={id}
            label="Intake Form Status"
            labelTooltip={ONBOARDING_STAGE_LABEL_TOOLTIP}
            dynamic={dynamic}
        >
            <HoverTooltip
                className={historyStyles.historyEntryDateTag}
                triggerStyle={{
                    marginLeft: 0,
                    paddingInline: 0,
                    paddingBlock: 0,
                    borderRadius: 0,
                    background: 'transparent',
                    color: 'inherit',
                    fontSize: 'inherit',
                    fontWeight: 'inherit',
                }}
                content={description}
                focusable
            >
                {value}
            </HoverTooltip>
        </FormField>
    )
}

function DiscordUsernameField({ id, dynamic }: DiscordUsernameFieldProps) {
    const discordUsers = dynamic?.form.discordUsers ?? []
    const usernames = discordUsers
        .map((discordUser) => discordUser.username?.trim())
        .filter((username): username is string => !!username)
        .map((username) => `@${username}`)

    const value = usernames.length ? usernames.join(', ') : '-'
    const tooltip = discordUsers.length
        ? discordUsers
              .map((discordUser) => {
                  const idValue = discordUser.id ?? 'Unknown ID'
                  return `Discord ID: @${idValue}`
              })
              .join('\n')
        : 'No Discord account linked.'

    return (
        <FormField<User, unknown> id={id} label="Discord Username" dynamic={dynamic}>
            <HoverTooltip
                className={historyStyles.historyEntryDateTag}
                triggerStyle={{
                    marginLeft: 0,
                    paddingInline: 0,
                    paddingBlock: 0,
                    borderRadius: 0,
                    background: 'transparent',
                    color: 'inherit',
                    fontSize: 'inherit',
                    fontWeight: 'inherit',
                }}
                content={tooltip}
                focusable
            >
                {value}
            </HoverTooltip>
        </FormField>
    )
}

function EditableAddressFields({ dynamic }: EditableAddressFieldsProps) {
    if (dynamic?.editing != true) return null

    const textDynamic =
        dynamic as DynamicFormFieldProps<User, string | null | undefined>

    return (
        <>
            <TextField<User>
                id="address-line-1"
                label="Address Line 1"
                getter={(form) => form.address.addressLine1}
                setter={(form, field) => ({
                    ...form,
                    address: {
                        ...form.address,
                        addressLine1: field?.slice(0, 100) ?? null,
                    },
                })}
                dynamic={textDynamic}
            />
            <TextField<User>
                id="address-line-2"
                label="Address Line 2"
                getter={(form) => form.address.addressLine2}
                setter={(form, field) => ({
                    ...form,
                    address: {
                        ...form.address,
                        addressLine2: field?.slice(0, 100) ?? null,
                    },
                })}
                dynamic={textDynamic}
            />
            <TextField<User>
                id="address-city"
                label="City"
                getter={(form) => form.address.city}
                setter={(form, field) => ({
                    ...form,
                    address: {
                        ...form.address,
                        city: field?.slice(0, 50) ?? null,
                    },
                })}
                dynamic={textDynamic}
            />
            <TextField<User>
                id="address-state"
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
                dynamic={textDynamic}
            />
            <TextField<User>
                id="address-zip"
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
                dynamic={textDynamic}
            />
        </>
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
                <NameFields />
                <DiscordUsernameField />
                <PhoneField label="Phone Number" field="phone" required />
                <TextField
                    label="Email"
                    field="email"
                    autocomplete="email"
                    required
                />
                <PreferredNameField />
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
                <DateField label="Account Created" field="createdAtUtc" readonly />
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
                <ReadonlyAddressField />
                <EditableAddressFields />
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
                <OnboardingStageField />
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
    )
}
