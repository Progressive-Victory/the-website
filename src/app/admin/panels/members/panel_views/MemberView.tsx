'use client'

import { BlockField } from './BlockField'
import styles from './MemberView.module.css'
import { DropdownButton, DropdownMenu } from '@/components/common'
import {
    DynamicFormFieldProps,
    FormField,
    DateField,
    Form,
    FormGroup,
    FormState,
    formatPhoneDisplay,
    PhoneField,
    SelectManyField,
    TextField,
} from '@/components/common/forms'
import { OnboardingStage, Role, UpdateHistory, User } from '@/contracts/data'
import { dateService } from '@/services'
import { InformationCircleIcon } from '@heroicons/react/24/outline'
import { useCallback, useEffect, useRef, useState } from 'react'
import { FaSave, FaTrashAlt } from 'react-icons/fa'
import { FaPlus } from 'react-icons/fa6'

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

function formatOnboardingStage(stage: OnboardingStage | null | undefined) {
    if (!stage) return null

    return stage
        .split('_')
        .map((word) =>
            word.length ? word.charAt(0).toUpperCase() + word.slice(1) : word
        )
        .join(' ')
}

interface PreferredNameFieldProps {
    dynamic?: DynamicFormFieldProps<User>
}

interface NameFieldsProps {
    id?: string
    dynamic?: DynamicFormFieldProps<User>
}

function PreferredNameField({ dynamic }: PreferredNameFieldProps) {
    const preferredName = dynamic?.form.preferredName?.trim()

    if (!preferredName) return null

    const textDynamic = dynamic as
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
            <FormField<User, unknown>
                id={id}
                label="Full Name"
                dynamic={dynamic}
            >
                <div>{fullName || '-'}</div>
            </FormField>
        )
    }

    const textDynamic = dynamic as
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

function EditableAddressFields({ dynamic }: EditableAddressFieldsProps) {
    if (dynamic?.editing != true) return null

    const textDynamic = dynamic as DynamicFormFieldProps<
        User,
        string | null | undefined
    >

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
                            field?.trim()?.toUpperCase()?.slice(0, 2) ?? null,
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
    const [contactInfoEditMode, setContactInfoEditMode] = useState(false)
    const [addressInfoEditMode, setAddressInfoEditMode] = useState(false)
    const [rolesInfoEditMode, setRolesInfoEditMode] = useState(false)
    const [contactEditDraft, setContactEditDraft] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
    })
    const [addressEditDraft, setAddressEditDraft] = useState({
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        zip: '',
        county: '',
    })
    const [rolesEditDraft, setRolesEditDraft] = useState<number[]>([])
    const [rolesAddMenuOpen, setRolesAddMenuOpen] = useState(false)
    const [focusedContactField, setFocusedContactField] = useState<
        'firstName' | 'lastName' | 'phone' | 'email' | null
    >(null)
    const [focusedAddressField, setFocusedAddressField] = useState<
        | 'addressLine1'
        | 'addressLine2'
        | 'city'
        | 'state'
        | 'zip'
        | 'county'
        | null
    >(null)

    const [collapsedInfoBlocks, setCollapsedInfoBlocks] = useState({
        contact: false,
        address: false,
        accountStatus: false,
        roles: false,
    })

    const [openInfoMenu, setOpenInfoMenu] = useState<
        'contact' | 'address' | 'accountStatus' | 'roles' | null
    >(null)

    const contactMenuButtonRef = useRef<HTMLButtonElement | null>(null)
    const addressMenuButtonRef = useRef<HTMLButtonElement | null>(null)
    const accountStatusMenuButtonRef = useRef<HTMLButtonElement | null>(null)
    const rolesMenuButtonRef = useRef<HTMLButtonElement | null>(null)
    const infoGridRef = useRef<HTMLDivElement | null>(null)
    const contactBodyContentRef = useRef<HTMLDivElement | null>(null)
    const addressBodyContentRef = useRef<HTMLDivElement | null>(null)
    const accountStatusBodyContentRef = useRef<HTMLDivElement | null>(null)
    const rolesBodyContentRef = useRef<HTMLDivElement | null>(null)
    const rolesAddButtonRef = useRef<HTMLButtonElement | null>(null)

    const [bodyHeights, setBodyHeights] = useState({
        contact: 0,
        address: 0,
        accountStatus: 0,
        roles: 0,
    })

    const measureBodyHeights = useCallback(() => {
        setBodyHeights({
            contact: contactBodyContentRef.current?.scrollHeight ?? 0,
            address: addressBodyContentRef.current?.scrollHeight ?? 0,
            accountStatus:
                accountStatusBodyContentRef.current?.scrollHeight ?? 0,
            roles: rolesBodyContentRef.current?.scrollHeight ?? 0,
        })
    }, [])

    const fullName = [user.firstName?.trim(), user.lastName?.trim()]
        .filter(Boolean)
        .join(' ')
    const preferredName = user.preferredName?.trim()
    const discordUsername = (user.discordUsers ?? [])
        .map(({ username }) => `@${username}`)
        .join(', ')
    const phoneNumber = user.phone?.trim()
    const formattedPhoneNumber = phoneNumber
        ? formatPhoneDisplay(phoneNumber)
        : null
    const email = user.email?.trim()
    const addressLine1 = user.address.addressLine1?.trim()
    const addressLine2 = user.address.addressLine2?.trim()
    const city = user.address.city?.trim()
    const state = user.address.state?.trim()
    const zip = user.address.zip?.trim()
    const county = user.address.county?.trim()
    const cityState = [city, state].filter(Boolean).join(', ')
    const cityStateZip = [cityState, zip].filter(Boolean).join(' ')
    const fullAddressLines = [addressLine1, addressLine2, cityStateZip].filter(
        Boolean
    )
    const acceptedAlertsText =
        user.acceptedAlerts == null
            ? 'Not set'
            : user.acceptedAlerts
              ? 'Yes'
              : 'No'
    const verifiedText =
        user.verified == null ? 'Not set' : user.verified ? 'Yes' : 'No'
    const intakeFormStatus = formatOnboardingStage(user.onboardingStage) ?? '-'
    const formatInfoDate = (value: Date | string | null | undefined) => {
        if (!dateService.isValid(value)) return '-'

        const iso = dateService.toISODateString(value)
        if (!iso) return '-'

        return new Date(iso).toLocaleDateString('en-US', {
            timeZone: 'UTC',
            dateStyle: 'medium',
        })
    }
    const completedIntakeDate = formatInfoDate(user.completedIntakeUtc)
    const joinedServerDate = formatInfoDate(user.joinedAtUtc)
    const userRoleNames = (user.roles ?? []).map((r) => r.name).sort()
    const userRoleNamesKey = userRoleNames.join('|')
    const rolesEditDraftKey = rolesEditDraft.join('|')
    const availableRoleOptions = roleOptions.filter(
        (o) => !rolesEditDraft.includes(Number(o.value))
    )

    const selectedUserName =
        fullName.length > 0
            ? fullName
            : preferredName != null && preferredName.length > 0
              ? preferredName
              : '-'

    useEffect(() => {
        measureBodyHeights()

        const handleResize = () => measureBodyHeights()
        window.addEventListener('resize', handleResize)

        return () => window.removeEventListener('resize', handleResize)
    }, [
        measureBodyHeights,
        selectedUserName,
        contactInfoEditMode,
        addressInfoEditMode,
        rolesInfoEditMode,
        addressLine1,
        addressLine2,
        cityStateZip,
        county,
        acceptedAlertsText,
        verifiedText,
        intakeFormStatus,
        completedIntakeDate,
        joinedServerDate,
        userRoleNamesKey,
        rolesEditDraftKey,
    ])

    const toggleInfoBlockCollapse = (
        block: 'contact' | 'address' | 'accountStatus' | 'roles'
    ) => {
        setCollapsedInfoBlocks((current) => ({
            ...current,
            [block]: !current[block],
        }))
        setOpenInfoMenu(null)
    }

    const startContactInfoEditMode = () => {
        setContactEditDraft({
            firstName: user.firstName ?? '',
            lastName: user.lastName ?? '',
            phone: user.phone ?? '',
            email: user.email ?? '',
        })
        setOpenInfoMenu(null)
        setContactInfoEditMode(true)
    }

    const startAddressInfoEditMode = () => {
        setAddressEditDraft({
            addressLine1: user.address.addressLine1 ?? '',
            addressLine2: user.address.addressLine2 ?? '',
            city: user.address.city ?? '',
            state: user.address.state ?? '',
            zip: user.address.zip ?? '',
            county: user.address.county ?? '',
        })
        setOpenInfoMenu(null)
        setAddressInfoEditMode(true)
    }

    const cancelContactInfoEditMode = () => {
        setFocusedContactField(null)
        setContactInfoEditMode(false)
    }

    const cancelAddressInfoEditMode = () => {
        setFocusedAddressField(null)
        setAddressInfoEditMode(false)
    }

    const asNullableTrimmed = (value: string) => {
        const trimmed = value.trim()
        return trimmed.length ? trimmed : null
    }

    const normalizeZip = (value: string) => {
        const digits = value.replace(/\D/g, '')
        return digits.length ? digits.padStart(5, '0').slice(-5) : null
    }

    const saveContactInfoEditMode = () => {
        const nextUser: User = {
            ...user,
            firstName: asNullableTrimmed(contactEditDraft.firstName),
            lastName: asNullableTrimmed(contactEditDraft.lastName),
            phone: asNullableTrimmed(contactEditDraft.phone),
            email: asNullableTrimmed(contactEditDraft.email),
        }

        handleSave?.(nextUser)
        setFocusedContactField(null)
        setContactInfoEditMode(false)
    }

    const saveAddressInfoEditMode = () => {
        const nextUser: User = {
            ...user,
            address: {
                ...user.address,
                addressLine1: asNullableTrimmed(addressEditDraft.addressLine1),
                addressLine2: asNullableTrimmed(addressEditDraft.addressLine2),
                city: asNullableTrimmed(addressEditDraft.city),
                state:
                    asNullableTrimmed(addressEditDraft.state)
                        ?.toUpperCase()
                        .slice(0, 2) ?? null,
                zip: normalizeZip(addressEditDraft.zip),
                county: asNullableTrimmed(addressEditDraft.county),
            },
        }

        handleSave?.(nextUser)
        setFocusedAddressField(null)
        setAddressInfoEditMode(false)
    }

    const startRolesInfoEditMode = () => {
        setRolesEditDraft((user.roles ?? []).map((r) => r.id))
        setOpenInfoMenu(null)
        setRolesInfoEditMode(true)
    }

    const cancelRolesInfoEditMode = () => {
        setRolesAddMenuOpen(false)
        setRolesInfoEditMode(false)
    }

    const saveRolesInfoEditMode = () => {
        setRolesAddMenuOpen(false)
        const allRoles = Array.from(
            new Map(
                [...(user.roles ?? []), ...roles].map((role) => [
                    role.id.toString(),
                    role,
                ])
            ).values()
        )
        const nextUser: User = {
            ...user,
            roles: allRoles.filter((role) =>
                rolesEditDraft.some((id) => id === role.id)
            ),
        }
        handleSave?.(nextUser)
        setRolesInfoEditMode(false)
    }

    return (
        <div className={styles.memberView}>
            <div ref={infoGridRef} className={styles.infoGrid}>
                <div
                    className={`${styles.infoBlock} ${openInfoMenu == 'contact' ? styles.infoBlockMenuOpen : ''}`}
                >
                    <div className={styles.infoBlockHeader}>
                        <h1 className={styles.infoBlockTitle}>Contact Info</h1>
                        {contactInfoEditMode ? (
                            <div className={styles.infoBlockHeaderActions}>
                                <button
                                    type="button"
                                    className={`${styles.infoBlockActionButton} ${styles.infoBlockActionButtonSave}`}
                                    onClick={saveContactInfoEditMode}
                                >
                                    <FaSave aria-hidden="true" />
                                    Save
                                </button>
                                <button
                                    type="button"
                                    className={`${styles.infoBlockActionButton} ${styles.infoBlockActionButtonCancel}`}
                                    onClick={cancelContactInfoEditMode}
                                >
                                    <FaTrashAlt aria-hidden="true" />
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <div className={styles.infoBlockMenuControl}>
                                <DropdownButton
                                    ref={contactMenuButtonRef}
                                    buttonVariant="short"
                                    isOpen={openInfoMenu == 'contact'}
                                    aria-label="Contact info options"
                                    onClick={() =>
                                        setOpenInfoMenu((current) =>
                                            current == 'contact'
                                                ? null
                                                : 'contact'
                                        )
                                    }
                                    menu={
                                        <DropdownMenu
                                            triggerRef={contactMenuButtonRef}
                                            onClose={() =>
                                                setOpenInfoMenu(null)
                                            }
                                            boundaryRef={infoGridRef}
                                            label="Quick Actions"
                                            role="menu"
                                            aria-label="Contact info menu"
                                        >
                                            {collapsedInfoBlocks.contact ? (
                                                <DropdownMenu.Button
                                                    label="Show"
                                                    onClick={() =>
                                                        toggleInfoBlockCollapse(
                                                            'contact'
                                                        )
                                                    }
                                                />
                                            ) : (
                                                <>
                                                    <DropdownMenu.Button
                                                        label="Hide"
                                                        onClick={() =>
                                                            toggleInfoBlockCollapse(
                                                                'contact'
                                                            )
                                                        }
                                                    />
                                                    <DropdownMenu.Divider />
                                                    <DropdownMenu.Button
                                                        label="Edit"
                                                        onClick={
                                                            startContactInfoEditMode
                                                        }
                                                    />
                                                    <DropdownMenu.Button
                                                        label="View History"
                                                        onClick={() =>
                                                            setOpenInfoMenu(
                                                                null
                                                            )
                                                        }
                                                    />
                                                </>
                                            )}
                                        </DropdownMenu>
                                    }
                                />
                            </div>
                        )}
                    </div>
                    <div
                        className={`${styles.infoBlockBody} ${collapsedInfoBlocks.contact ? styles.infoBlockBodyCollapsed : styles.infoBlockBodyExpanded}`}
                        style={{
                            height: collapsedInfoBlocks.contact
                                ? '0px'
                                : `${bodyHeights.contact}px`,
                        }}
                        aria-hidden={collapsedInfoBlocks.contact}
                    >
                        <div
                            ref={contactBodyContentRef}
                            className={styles.infoBlockBodyContent}
                        >
                            <BlockField
                                label="Name"
                                ariaLabel="Name info"
                                editing={contactInfoEditMode}
                                showIn="view"
                                value={selectedUserName}
                            />
                            <BlockField
                                label="First Name"
                                ariaLabel="First name"
                                editing={contactInfoEditMode}
                                showIn="edit"
                                edit={{
                                    value: contactEditDraft.firstName,
                                    placeholder:
                                        focusedContactField == 'firstName'
                                            ? (user.firstName ?? '')
                                            : 'Empty',
                                    onFocus: () =>
                                        setFocusedContactField('firstName'),
                                    onBlur: () => setFocusedContactField(null),
                                    onChange: (e) =>
                                        setContactEditDraft((d) => ({
                                            ...d,
                                            firstName: e.target.value,
                                        })),
                                }}
                            />
                            <BlockField
                                label="Last Name"
                                ariaLabel="Last name"
                                editing={contactInfoEditMode}
                                showIn="edit"
                                edit={{
                                    value: contactEditDraft.lastName,
                                    placeholder:
                                        focusedContactField == 'lastName'
                                            ? (user.lastName ?? '')
                                            : 'Empty',
                                    onFocus: () =>
                                        setFocusedContactField('lastName'),
                                    onBlur: () => setFocusedContactField(null),
                                    onChange: (e) =>
                                        setContactEditDraft((d) => ({
                                            ...d,
                                            lastName: e.target.value,
                                        })),
                                }}
                            />
                            <BlockField
                                label="Discord"
                                ariaLabel="Discord info"
                                editing={contactInfoEditMode}
                                value={discordUsername || '-'}
                            />
                            <BlockField
                                label="Phone"
                                ariaLabel="Phone info"
                                editing={contactInfoEditMode}
                                value={formattedPhoneNumber ?? '-'}
                                edit={{
                                    inputType: 'tel',
                                    value: contactEditDraft.phone,
                                    placeholder:
                                        focusedContactField == 'phone'
                                            ? (formattedPhoneNumber ?? '')
                                            : 'Empty',
                                    onFocus: () =>
                                        setFocusedContactField('phone'),
                                    onBlur: () => setFocusedContactField(null),
                                    onChange: (e) =>
                                        setContactEditDraft((d) => ({
                                            ...d,
                                            phone: e.target.value,
                                        })),
                                }}
                            />
                            <BlockField
                                label="Email"
                                ariaLabel="Email info"
                                editing={contactInfoEditMode}
                                value={email ?? '-'}
                                edit={{
                                    inputType: 'email',
                                    value: contactEditDraft.email,
                                    placeholder:
                                        focusedContactField == 'email'
                                            ? (email ?? '')
                                            : 'Empty',
                                    onFocus: () =>
                                        setFocusedContactField('email'),
                                    onBlur: () => setFocusedContactField(null),
                                    onChange: (e) =>
                                        setContactEditDraft((d) => ({
                                            ...d,
                                            email: e.target.value,
                                        })),
                                }}
                            />
                        </div>
                    </div>
                </div>
                <div
                    className={`${styles.infoBlock} ${openInfoMenu == 'address' ? styles.infoBlockMenuOpen : ''}`}
                >
                    <div className={styles.infoBlockHeader}>
                        <h1 className={styles.infoBlockTitle}>Address Info</h1>
                        {addressInfoEditMode ? (
                            <div className={styles.infoBlockHeaderActions}>
                                <button
                                    type="button"
                                    className={`${styles.infoBlockActionButton} ${styles.infoBlockActionButtonSave}`}
                                    onClick={saveAddressInfoEditMode}
                                >
                                    <FaSave aria-hidden="true" />
                                    Save
                                </button>
                                <button
                                    type="button"
                                    className={`${styles.infoBlockActionButton} ${styles.infoBlockActionButtonCancel}`}
                                    onClick={cancelAddressInfoEditMode}
                                >
                                    <FaTrashAlt aria-hidden="true" />
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <div className={styles.infoBlockMenuControl}>
                                <DropdownButton
                                    ref={addressMenuButtonRef}
                                    buttonVariant="short"
                                    isOpen={openInfoMenu == 'address'}
                                    aria-label="Address info options"
                                    onClick={() =>
                                        setOpenInfoMenu((current) =>
                                            current == 'address'
                                                ? null
                                                : 'address'
                                        )
                                    }
                                    menu={
                                        <DropdownMenu
                                            triggerRef={addressMenuButtonRef}
                                            onClose={() =>
                                                setOpenInfoMenu(null)
                                            }
                                            boundaryRef={infoGridRef}
                                            label="Quick Actions"
                                            role="menu"
                                            aria-label="Address info menu"
                                        >
                                            {collapsedInfoBlocks.address ? (
                                                <DropdownMenu.Button
                                                    label="Show"
                                                    onClick={() =>
                                                        toggleInfoBlockCollapse(
                                                            'address'
                                                        )
                                                    }
                                                />
                                            ) : (
                                                <>
                                                    <DropdownMenu.Button
                                                        label="Hide"
                                                        onClick={() =>
                                                            toggleInfoBlockCollapse(
                                                                'address'
                                                            )
                                                        }
                                                    />
                                                    <DropdownMenu.Divider />
                                                    <DropdownMenu.Button
                                                        label="Edit"
                                                        onClick={
                                                            startAddressInfoEditMode
                                                        }
                                                    />
                                                    <DropdownMenu.Button
                                                        label="View History"
                                                        onClick={() =>
                                                            setOpenInfoMenu(
                                                                null
                                                            )
                                                        }
                                                    />
                                                </>
                                            )}
                                        </DropdownMenu>
                                    }
                                />
                            </div>
                        )}
                    </div>
                    <div
                        className={`${styles.infoBlockBody} ${collapsedInfoBlocks.address ? styles.infoBlockBodyCollapsed : styles.infoBlockBodyExpanded}`}
                        style={{
                            height: collapsedInfoBlocks.address
                                ? '0px'
                                : `${bodyHeights.address}px`,
                        }}
                        aria-hidden={collapsedInfoBlocks.address}
                    >
                        <div
                            ref={addressBodyContentRef}
                            className={styles.infoBlockBodyContent}
                        >
                            {addressInfoEditMode ? (
                                <>
                                    <div className={styles.infoBlockFieldRow}>
                                        <span
                                            className={
                                                styles.infoBlockFieldLabel
                                            }
                                        >
                                            Address Line 1
                                        </span>
                                        <input
                                            type="text"
                                            className={
                                                styles.infoBlockFieldInput
                                            }
                                            value={
                                                addressEditDraft.addressLine1
                                            }
                                            placeholder={
                                                focusedAddressField ==
                                                'addressLine1'
                                                    ? (addressLine1 ?? '')
                                                    : 'Empty'
                                            }
                                            onFocus={() =>
                                                setFocusedAddressField(
                                                    'addressLine1'
                                                )
                                            }
                                            onBlur={() =>
                                                setFocusedAddressField(null)
                                            }
                                            onChange={(e) =>
                                                setAddressEditDraft(
                                                    (draft) => ({
                                                        ...draft,
                                                        addressLine1:
                                                            e.target.value,
                                                    })
                                                )
                                            }
                                            aria-label="Address line 1"
                                        />
                                    </div>
                                    <div className={styles.infoBlockFieldRow}>
                                        <span
                                            className={
                                                styles.infoBlockFieldLabel
                                            }
                                        >
                                            Address Line 2
                                        </span>
                                        <input
                                            type="text"
                                            className={
                                                styles.infoBlockFieldInput
                                            }
                                            value={
                                                addressEditDraft.addressLine2
                                            }
                                            placeholder={
                                                focusedAddressField ==
                                                'addressLine2'
                                                    ? (addressLine2 ?? '')
                                                    : 'Empty'
                                            }
                                            onFocus={() =>
                                                setFocusedAddressField(
                                                    'addressLine2'
                                                )
                                            }
                                            onBlur={() =>
                                                setFocusedAddressField(null)
                                            }
                                            onChange={(e) =>
                                                setAddressEditDraft(
                                                    (draft) => ({
                                                        ...draft,
                                                        addressLine2:
                                                            e.target.value,
                                                    })
                                                )
                                            }
                                            aria-label="Address line 2"
                                        />
                                    </div>
                                    <div className={styles.infoBlockFieldRow}>
                                        <span
                                            className={
                                                styles.infoBlockFieldLabel
                                            }
                                        >
                                            City
                                        </span>
                                        <input
                                            type="text"
                                            className={
                                                styles.infoBlockFieldInput
                                            }
                                            value={addressEditDraft.city}
                                            placeholder={
                                                focusedAddressField == 'city'
                                                    ? (city ?? '')
                                                    : 'Empty'
                                            }
                                            onFocus={() =>
                                                setFocusedAddressField('city')
                                            }
                                            onBlur={() =>
                                                setFocusedAddressField(null)
                                            }
                                            onChange={(e) =>
                                                setAddressEditDraft(
                                                    (draft) => ({
                                                        ...draft,
                                                        city: e.target.value,
                                                    })
                                                )
                                            }
                                            aria-label="City"
                                        />
                                    </div>
                                    <div className={styles.infoBlockFieldRow}>
                                        <span
                                            className={
                                                styles.infoBlockFieldLabel
                                            }
                                        >
                                            State
                                        </span>
                                        <input
                                            type="text"
                                            className={
                                                styles.infoBlockFieldInput
                                            }
                                            value={addressEditDraft.state}
                                            placeholder={
                                                focusedAddressField == 'state'
                                                    ? (state ?? '')
                                                    : 'Empty'
                                            }
                                            onFocus={() =>
                                                setFocusedAddressField('state')
                                            }
                                            onBlur={() =>
                                                setFocusedAddressField(null)
                                            }
                                            onChange={(e) =>
                                                setAddressEditDraft(
                                                    (draft) => ({
                                                        ...draft,
                                                        state: e.target.value,
                                                    })
                                                )
                                            }
                                            aria-label="State"
                                        />
                                    </div>
                                    <div className={styles.infoBlockFieldRow}>
                                        <span
                                            className={
                                                styles.infoBlockFieldLabel
                                            }
                                        >
                                            Zip
                                        </span>
                                        <input
                                            type="text"
                                            className={
                                                styles.infoBlockFieldInput
                                            }
                                            value={addressEditDraft.zip}
                                            placeholder={
                                                focusedAddressField == 'zip'
                                                    ? (zip ?? '')
                                                    : 'Empty'
                                            }
                                            onFocus={() =>
                                                setFocusedAddressField('zip')
                                            }
                                            onBlur={() =>
                                                setFocusedAddressField(null)
                                            }
                                            onChange={(e) =>
                                                setAddressEditDraft(
                                                    (draft) => ({
                                                        ...draft,
                                                        zip: e.target.value,
                                                    })
                                                )
                                            }
                                            aria-label="Zip"
                                        />
                                    </div>
                                    <div className={styles.infoBlockFieldRow}>
                                        <span
                                            className={
                                                styles.infoBlockFieldLabel
                                            }
                                        >
                                            County
                                        </span>
                                        <input
                                            type="text"
                                            className={
                                                styles.infoBlockFieldInput
                                            }
                                            value={addressEditDraft.county}
                                            placeholder={
                                                focusedAddressField == 'county'
                                                    ? (county ?? '')
                                                    : 'Empty'
                                            }
                                            onFocus={() =>
                                                setFocusedAddressField('county')
                                            }
                                            onBlur={() =>
                                                setFocusedAddressField(null)
                                            }
                                            onChange={(e) =>
                                                setAddressEditDraft(
                                                    (draft) => ({
                                                        ...draft,
                                                        county: e.target.value,
                                                    })
                                                )
                                            }
                                            aria-label="County"
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div
                                        className={`${styles.infoBlockFieldRow} ${styles.infoBlockFieldRowMultiline}`}
                                    >
                                        <span
                                            className={
                                                styles.infoBlockFieldLabel
                                            }
                                        >
                                            Full Address
                                        </span>
                                        <div
                                            className={`${styles.infoBlockFieldValue} ${styles.infoBlockFieldValueMultiline}`}
                                        >
                                            {fullAddressLines.length > 0
                                                ? fullAddressLines.map(
                                                      (line, index) => (
                                                          <span
                                                              key={`${line}-${index}`}
                                                              className={
                                                                  styles.infoBlockFieldValueLine
                                                              }
                                                          >
                                                              {line}
                                                          </span>
                                                      )
                                                  )
                                                : '-'}
                                        </div>
                                    </div>
                                    <div className={styles.infoBlockFieldRow}>
                                        <span
                                            className={
                                                styles.infoBlockFieldLabel
                                            }
                                        >
                                            County
                                        </span>
                                        <div
                                            className={
                                                styles.infoBlockFieldValue
                                            }
                                        >
                                            {county ?? '-'}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <div
                    className={`${styles.infoBlock} ${openInfoMenu == 'accountStatus' ? styles.infoBlockMenuOpen : ''}`}
                >
                    <div className={styles.infoBlockHeader}>
                        <h1 className={styles.infoBlockTitle}>
                            Account Status
                        </h1>
                        <div className={styles.infoBlockMenuControl}>
                            <DropdownButton
                                ref={accountStatusMenuButtonRef}
                                buttonVariant="short"
                                isOpen={openInfoMenu == 'accountStatus'}
                                aria-label="Account status options"
                                onClick={() =>
                                    setOpenInfoMenu((current) =>
                                        current == 'accountStatus'
                                            ? null
                                            : 'accountStatus'
                                    )
                                }
                                menu={
                                    <DropdownMenu
                                        triggerRef={accountStatusMenuButtonRef}
                                        onClose={() => setOpenInfoMenu(null)}
                                        boundaryRef={infoGridRef}
                                        label="Quick Actions"
                                        role="menu"
                                        aria-label="Account status menu"
                                    >
                                        {collapsedInfoBlocks.accountStatus ? (
                                            <DropdownMenu.Button
                                                label="Show"
                                                onClick={() =>
                                                    toggleInfoBlockCollapse(
                                                        'accountStatus'
                                                    )
                                                }
                                            />
                                        ) : (
                                            <>
                                                <DropdownMenu.Button
                                                    label="Hide"
                                                    onClick={() =>
                                                        toggleInfoBlockCollapse(
                                                            'accountStatus'
                                                        )
                                                    }
                                                />
                                                <DropdownMenu.Divider />
                                                <DropdownMenu.Button
                                                    label="View History"
                                                    onClick={() =>
                                                        setOpenInfoMenu(null)
                                                    }
                                                />
                                            </>
                                        )}
                                    </DropdownMenu>
                                }
                            />
                        </div>
                    </div>
                    <div
                        className={`${styles.infoBlockBody} ${collapsedInfoBlocks.accountStatus ? styles.infoBlockBodyCollapsed : styles.infoBlockBodyExpanded}`}
                        style={{
                            height: collapsedInfoBlocks.accountStatus
                                ? '0px'
                                : `${bodyHeights.accountStatus}px`,
                        }}
                        aria-hidden={collapsedInfoBlocks.accountStatus}
                    >
                        <div
                            ref={accountStatusBodyContentRef}
                            className={styles.infoBlockBodyContent}
                        >
                            <div className={styles.infoBlockFieldRow}>
                                <span className={styles.infoBlockFieldLabel}>
                                    Accepted Alerts
                                </span>
                                <button
                                    type="button"
                                    className={styles.infoBlockInfoButton}
                                    aria-label="Accepted alerts info"
                                >
                                    <span
                                        className={styles.infoBlockFieldValue}
                                    >
                                        {acceptedAlertsText}
                                    </span>
                                    <InformationCircleIcon
                                        className={styles.infoBlockInfoIcon}
                                    />
                                </button>
                            </div>
                            <div className={styles.infoBlockFieldRow}>
                                <span className={styles.infoBlockFieldLabel}>
                                    Verified
                                </span>
                                <button
                                    type="button"
                                    className={styles.infoBlockInfoButton}
                                    aria-label="Verified info"
                                >
                                    <span
                                        className={styles.infoBlockFieldValue}
                                    >
                                        {verifiedText}
                                    </span>
                                    <InformationCircleIcon
                                        className={styles.infoBlockInfoIcon}
                                    />
                                </button>
                            </div>
                            <div className={styles.infoBlockFieldRow}>
                                <span className={styles.infoBlockFieldLabel}>
                                    Intake Form Status
                                </span>
                                <button
                                    type="button"
                                    className={styles.infoBlockInfoButton}
                                    aria-label="Intake form status info"
                                >
                                    <span
                                        className={styles.infoBlockFieldValue}
                                    >
                                        {intakeFormStatus}
                                    </span>
                                    <InformationCircleIcon
                                        className={styles.infoBlockInfoIcon}
                                    />
                                </button>
                            </div>
                            <div className={styles.infoBlockFieldRow}>
                                <span className={styles.infoBlockFieldLabel}>
                                    Date Intake Done
                                </span>
                                <button
                                    type="button"
                                    className={styles.infoBlockInfoButton}
                                    aria-label="Date intake done info"
                                >
                                    <span
                                        className={styles.infoBlockFieldValue}
                                    >
                                        {completedIntakeDate}
                                    </span>
                                    <InformationCircleIcon
                                        className={styles.infoBlockInfoIcon}
                                    />
                                </button>
                            </div>
                            <div className={styles.infoBlockFieldRow}>
                                <span className={styles.infoBlockFieldLabel}>
                                    Date Server Joined
                                </span>
                                <button
                                    type="button"
                                    className={styles.infoBlockInfoButton}
                                    aria-label="Date server joined info"
                                >
                                    <span
                                        className={styles.infoBlockFieldValue}
                                    >
                                        {joinedServerDate}
                                    </span>
                                    <InformationCircleIcon
                                        className={styles.infoBlockInfoIcon}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    className={`${styles.infoBlock} ${styles.infoBlockFullWidth} ${openInfoMenu == 'roles' ? styles.infoBlockMenuOpen : ''}`}
                >
                    <div className={styles.infoBlockHeader}>
                        <h1 className={styles.infoBlockTitle}>Roles</h1>
                        {rolesInfoEditMode ? (
                            <div className={styles.infoBlockHeaderActions}>
                                {availableRoleOptions.length > 0 && (
                                    <div
                                        className={styles.infoBlockMenuControl}
                                    >
                                        <button
                                            ref={rolesAddButtonRef}
                                            type="button"
                                            className={
                                                styles.infoBlockRoleAddButton
                                            }
                                            aria-label="Add role"
                                            aria-haspopup="menu"
                                            aria-expanded={rolesAddMenuOpen}
                                            onClick={() =>
                                                setRolesAddMenuOpen((o) => !o)
                                            }
                                        >
                                            <FaPlus size={11} />
                                        </button>
                                        {rolesAddMenuOpen && (
                                            <DropdownMenu
                                                triggerRef={rolesAddButtonRef}
                                                onClose={() =>
                                                    setRolesAddMenuOpen(false)
                                                }
                                                boundaryRef={infoGridRef}
                                                label="Add Role"
                                                role="menu"
                                                aria-label="Available roles"
                                            >
                                                {availableRoleOptions.map(
                                                    (option) => (
                                                        <DropdownMenu.Button
                                                            key={option.value}
                                                            label={option.label}
                                                            onClick={() => {
                                                                setRolesEditDraft(
                                                                    (d) => [
                                                                        ...d,
                                                                        Number(
                                                                            option.value
                                                                        ),
                                                                    ]
                                                                )
                                                                setRolesAddMenuOpen(
                                                                    false
                                                                )
                                                            }}
                                                        />
                                                    )
                                                )}
                                            </DropdownMenu>
                                        )}
                                    </div>
                                )}
                                <button
                                    type="button"
                                    className={`${styles.infoBlockActionButton} ${styles.infoBlockActionButtonSave}`}
                                    onClick={saveRolesInfoEditMode}
                                >
                                    <FaSave aria-hidden="true" />
                                    Save
                                </button>
                                <button
                                    type="button"
                                    className={`${styles.infoBlockActionButton} ${styles.infoBlockActionButtonCancel}`}
                                    onClick={cancelRolesInfoEditMode}
                                >
                                    <FaTrashAlt aria-hidden="true" />
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <div className={styles.infoBlockMenuControl}>
                                <DropdownButton
                                    ref={rolesMenuButtonRef}
                                    buttonVariant="short"
                                    isOpen={openInfoMenu == 'roles'}
                                    aria-label="Roles options"
                                    onClick={() =>
                                        setOpenInfoMenu((current) =>
                                            current == 'roles' ? null : 'roles'
                                        )
                                    }
                                    menu={
                                        <DropdownMenu
                                            triggerRef={rolesMenuButtonRef}
                                            onClose={() =>
                                                setOpenInfoMenu(null)
                                            }
                                            boundaryRef={infoGridRef}
                                            label="Quick Actions"
                                            role="menu"
                                            aria-label="Roles menu"
                                        >
                                            {collapsedInfoBlocks.roles ? (
                                                <DropdownMenu.Button
                                                    label="Show"
                                                    onClick={() =>
                                                        toggleInfoBlockCollapse(
                                                            'roles'
                                                        )
                                                    }
                                                />
                                            ) : (
                                                <>
                                                    <DropdownMenu.Button
                                                        label="Hide"
                                                        onClick={() =>
                                                            toggleInfoBlockCollapse(
                                                                'roles'
                                                            )
                                                        }
                                                    />
                                                    <DropdownMenu.Divider />
                                                    <DropdownMenu.Button
                                                        label="Edit"
                                                        onClick={
                                                            startRolesInfoEditMode
                                                        }
                                                    />
                                                </>
                                            )}
                                        </DropdownMenu>
                                    }
                                />
                            </div>
                        )}
                    </div>
                    <div
                        className={`${styles.infoBlockBody} ${collapsedInfoBlocks.roles ? styles.infoBlockBodyCollapsed : styles.infoBlockBodyExpanded}`}
                        style={{
                            height: collapsedInfoBlocks.roles
                                ? '0px'
                                : `${bodyHeights.roles}px`,
                        }}
                        aria-hidden={collapsedInfoBlocks.roles}
                    >
                        <div
                            ref={rolesBodyContentRef}
                            className={styles.infoBlockBodyContent}
                        >
                            {rolesInfoEditMode ? (
                                <div className={styles.infoBlockRoleList}>
                                    {rolesEditDraft.map((id) => {
                                        const label =
                                            roleOptions.find(
                                                (o) => Number(o.value) === id
                                            )?.label ?? String(id)
                                        return (
                                            <button
                                                key={id}
                                                type="button"
                                                className={`${styles.infoBlockRolePill} ${styles.infoBlockRolePillRemovable}`}
                                                onClick={() =>
                                                    setRolesEditDraft((d) =>
                                                        d.filter(
                                                            (rid) => rid !== id
                                                        )
                                                    )
                                                }
                                            >
                                                {label}
                                            </button>
                                        )
                                    })}
                                </div>
                            ) : userRoleNames.length > 0 ? (
                                <div className={styles.infoBlockRoleList}>
                                    {userRoleNames.map((name) => (
                                        <span
                                            key={name}
                                            className={styles.infoBlockRolePill}
                                        >
                                            {name}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <div className={styles.infoBlockFieldRow}>
                                    <span
                                        className={styles.infoBlockFieldLabel}
                                    >
                                        No roles assigned
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
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
                    <NameFields />
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
