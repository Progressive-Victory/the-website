'use client'

import styles from './MemberView.module.css'
import { CollapsibleSection } from '@/components/common'
import {
    CheckboxField,
    DateField,
    Form,
    FormGroup,
    FormGroupProps,
    FormState,
    PhoneField,
    SelectManyField,
    TextField,
} from '@/components/common/forms'
import { Location, Role, UpdateHistory, User } from '@/contracts/data'
import { dateService } from '@/services'
import cx from 'classnames'

export interface MemberViewProps {
    selectedId: number
    user: User
    selectedHistory: UpdateHistory<User> | null
    onSelectHistory: (update: UpdateHistory<User> | null) => void

    formState: FormState<User> | null
    setFormState: (next: FormState<User> | null) => void

    saving: boolean
    isInvalid: boolean
    roles: Role[]
    roleOptions: { value: number; label: string }[]

    makeFormTitle: (user: User) => string
    handleSave: (user: User) => void

    getLocation: (form: User) => Location | null
}

export function MemberView({
    selectedId,
    user,
    selectedHistory,
    onSelectHistory,
    formState,
    setFormState,
    saving,
    isInvalid,
    roles,
    roleOptions,
    makeFormTitle,
    handleSave,
    getLocation,
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
                <TextField label="Email" field="email" required />
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
                    label="Zip Code"
                    getter={(form) =>
                        form.location?.zip
                            ? form.location?.zip
                                  .toString()
                                  .padStart(5, '0')
                                  .slice(-5)
                            : null
                    }
                    setter={(form, field) => ({
                        ...form,
                        location: field
                            ? {
                                  ...(user?.location ?? {
                                      city: '',
                                      county: '',
                                      state: '',
                                  }),
                                  zip: +field
                                      .replace(/[^\d]/, '')
                                      .padStart(5, '0')
                                      .slice(-5),
                              }
                            : null,
                    })}
                />
                <TextField<User>
                    label="City"
                    getter={(form) => getLocation(form)?.city}
                    readonly
                />
                <TextField<User>
                    label="County"
                    getter={(form) => getLocation(form)?.county}
                    readonly
                />
                <TextField<User>
                    label="State"
                    getter={(form) => getLocation(form)?.state}
                    readonly
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

            {!formState?.editing && !!user?.history?.length && (
                <AccountHistoryField
                    title="Account History"
                    history={user?.history}
                    selected={selectedHistory}
                    onSelect={onSelectHistory}
                    defaultCollapsed
                />
            )}
        </Form>
    )
}

interface AccountHistoryFieldProps extends FormGroupProps<User> {
    history?: UpdateHistory<User>[]
    selected: UpdateHistory<User> | null
    onSelect: (update: UpdateHistory<User> | null) => void
}

function AccountHistoryField({
    title,
    defaultCollapsed,
    history,
    selected,
    onSelect,
}: AccountHistoryFieldProps) {
    const value = (history ?? []).sort(
        (a, b) =>
            b.historyWhenUpdatedUtc.getTime() -
            a.historyWhenUpdatedUtc.getTime()
    )

    return (
        <CollapsibleSection title={title} initialOpenState={!defaultCollapsed}>
            <div className={styles.historyContainer}>
                {value.map((update, i) => (
                    <div key={i}>
                        <button
                            onClick={() => onSelect(i ? update : null)}
                            className={cx(
                                styles.historyEntry,
                                (selected?.historyId == update.historyId ||
                                    (!i && !selected)) &&
                                    styles.historyEntrySelected
                            )}
                        >
                            <span color="#4b5563">{`${update.historyType == 'I' ? 'Created' : 'Updated'} at `}</span>
                            <span className={styles.historyEntryDate}>
                                {update.historyWhenUpdatedUtc.toLocaleString()}
                            </span>
                            <span color="#4b5563">{' by '}</span>
                            <code>
                                {update.email ?? 'deleted user'}#
                                {update.id.toString()}
                            </code>
                        </button>
                    </div>
                ))}
            </div>
        </CollapsibleSection>
    )
}
