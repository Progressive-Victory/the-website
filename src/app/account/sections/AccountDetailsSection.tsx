'use client'

import InteractiveThreeCard from '../../home/MemberBanner'
import { AccountInfoForm } from '../AccountInfoForm'
import styles from '@/app/account/account.module.css'
import { DiscordAvatar } from '@/components/common'
import { BaseButton } from '@/components/common/buttons/Button'
import formStyles from '@/components/common/forms/Form.module.css'
import formFieldStyles from '@/components/common/forms/FormField.module.css'
import { MembershipDeliverableStatus, User } from '@/contracts/data'
import { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { IoClose } from 'react-icons/io5'

interface AccountDetailsSectionProps {
    userData: User
    canAccessAdminPanel: boolean
    handleSignOut: () => void
    onSave: (user: User) => void
    donorLinkError: Error | null
    onDonorLinkSubmit: (donorLinkForm: {
        donorEmail: string
        orderId: string
    }) => void
}

export function AccountDetailsSection({
    userData,
    canAccessAdminPanel,
    handleSignOut,
    onSave,
    donorLinkError,
    onDonorLinkSubmit,
}: AccountDetailsSectionProps) {
    const membershipDeliverableLabels: Record<
        MembershipDeliverableStatus,
        string
    > = {
        [MembershipDeliverableStatus.NotEligible]: 'Not Eligible',
        [MembershipDeliverableStatus.NotStarted]: 'Not Started',
        [MembershipDeliverableStatus.Printed]: 'Printed',
        [MembershipDeliverableStatus.InTransit]: 'In Transit',
        [MembershipDeliverableStatus.Recieved]: 'Received',
        [MembershipDeliverableStatus.Returned]: 'Returned',
    }

    const normalizeEmail = (value?: string | null) =>
        (value ?? '').trim().toLowerCase()

    const targetContributionPath = '/donate/pvmember'
    const recurringShirtSizeThreshold = 100
    const now = new Date()

    const normalizeContributionFormPath = (value?: string | null) => {
        const form = (value ?? '').trim().toLowerCase()
        if (!form) return ''

        if (form.startsWith('http://') || form.startsWith('https://')) {
            try {
                const url = new URL(form)
                return url.pathname.replace(/\/+$/, '')
            } catch {
                return form
            }
        }

        return form.replace(/\/+$/, '')
    }

    const isActiveRecurringContribution = (
        createdAt: Date,
        recurringPeriod?: string | null,
        recurringDuration?: number | null
    ) => {
        if ((recurringDuration ?? -1) < 0) return true

        const expiresAt = new Date(createdAt)
        if ((recurringPeriod ?? '').toLowerCase() === 'weekly') {
            expiresAt.setDate(
                expiresAt.getDate() + (recurringDuration ?? 0) * 7
            )
        } else {
            expiresAt.setMonth(expiresAt.getMonth() + (recurringDuration ?? 0))
        }

        return expiresAt > now
    }

    const hasActiveRecurringPvMemberContribution =
        userData.donors?.some((donor) =>
            (donor.contributions ?? []).some((contribution) => {
                const contributionForm = normalizeContributionFormPath(
                    contribution.contributionForm
                )
                const isPvMemberForm = contributionForm.endsWith(
                    targetContributionPath
                )

                return (
                    isPvMemberForm &&
                    contribution.isRecurring &&
                    isActiveRecurringContribution(
                        contribution.createdAt,
                        contribution.recurringPeriod,
                        contribution.recurringDuration
                    )
                )
            })
        ) ?? false

    const hasRecurringPvMemberContributionAtOrAboveThreshold =
        userData.donors?.some((donor) =>
            (donor.contributions ?? []).some((contribution) => {
                const contributionForm = normalizeContributionFormPath(
                    contribution.contributionForm
                )
                const isPvMemberForm = contributionForm.endsWith(
                    targetContributionPath
                )

                const hasRecurringAmountAtThreshold =
                    contribution.isRecurring &&
                    (contribution.lineitems ?? []).some(
                        (lineitem) =>
                            (lineitem.recurringAmount ?? lineitem.amount) >=
                            recurringShirtSizeThreshold
                    )

                return isPvMemberForm && hasRecurringAmountAtThreshold
            })
        ) ?? false

    const [donorLinkForm, setDonorLinkForm] = useState({
        donorEmail: '',
        orderId: '',
    })
    const [showDonorLinkForm, setShowDonorLinkForm] = useState(false)
    const [pendingLinkEmail, setPendingLinkEmail] = useState<string | null>(
        null
    )
    const [showAddressConfirmModal, setShowAddressConfirmModal] =
        useState(false)
    const [matchedDonorEmail, setMatchedDonorEmail] = useState<string | null>(
        null
    )
    const [addressDraft, setAddressDraft] = useState({ ...userData.address })
    const userHasDonor = !!userData.donors?.length

    useEffect(() => {
        if (!pendingLinkEmail) return

        const matchedDonor = userData.donors?.find(
            (donor) => normalizeEmail(donor.email) === pendingLinkEmail
        )
        if (!matchedDonor) return

        setAddressDraft({
            ...userData.address,
            addressLine1: matchedDonor.addr1 ?? userData.address.addressLine1,
            city: matchedDonor.city ?? userData.address.city,
            state: matchedDonor.state ?? userData.address.state,
            zip: matchedDonor.zip ?? userData.address.zip,
        })
        setMatchedDonorEmail(matchedDonor.email)
        setShowDonorLinkForm(false)
        setShowAddressConfirmModal(true)
        setPendingLinkEmail(null)
    }, [pendingLinkEmail, userData.address, userData.donors])

    const handleChangeDonorEmail = (e: ChangeEvent<HTMLInputElement>) => {
        setDonorLinkForm({
            ...donorLinkForm,
            donorEmail: e.target.value,
        })
    }

    const handleChangeOrderId = (e: ChangeEvent<HTMLInputElement>) => {
        setDonorLinkForm({
            ...donorLinkForm,
            orderId: e.target.value,
        })
    }

    const submitLinkForm = (e: FormEvent) => {
        e.preventDefault()
        setPendingLinkEmail(normalizeEmail(donorLinkForm.donorEmail))
        onDonorLinkSubmit(donorLinkForm)
    }

    const updateAddressDraft = (
        field: 'addressLine1' | 'addressLine2' | 'city' | 'state' | 'zip',
        value: string
    ) => {
        setAddressDraft((prev) => ({
            ...prev,
            [field]: value || null,
        }))
    }

    const submitAddressConfirmation = (e: FormEvent) => {
        e.preventDefault()
        const shouldUseMatchedEmail = !normalizeEmail(userData.email)
        const normalizeText = (value?: string | null) => {
            const trimmed = value?.trim() ?? ''
            return trimmed.length ? trimmed : null
        }
        const normalizedZipDigits = (addressDraft.zip ?? '')
            .replace(/\D/g, '')
            .slice(-5)
        const normalizedZip = normalizedZipDigits
            ? normalizedZipDigits.padStart(5, '0')
            : null

        onSave({
            ...userData,
            email: shouldUseMatchedEmail
                ? (matchedDonorEmail ?? userData.email)
                : userData.email,
            address: {
                ...userData.address,
                addressLine1: normalizeText(addressDraft.addressLine1),
                addressLine2: normalizeText(addressDraft.addressLine2),
                city: normalizeText(addressDraft.city),
                state: normalizeText(addressDraft.state)?.toUpperCase() ?? null,
                zip: normalizedZip,
            },
            addressConfirmed: true,
        })
        setShowAddressConfirmModal(false)
        setMatchedDonorEmail(null)
    }

    return (
        <section className={styles.content}>
            <header className={styles.contentHeader}>
                <div className={styles.headerTopRow}>
                    <div className={styles.headerTextBlock}>
                        <p className={styles.pageTitle}>Account Dashboard</p>

                        <p className={styles.pageSubtitle}>
                            View and update your personal account information.
                            We use this info to create and ship membership
                            cards.
                        </p>
                    </div>

                    <div className={styles.headerActions}>
                        {canAccessAdminPanel ? (
                            <BaseButton
                                label="Volunteer Dashboard"
                                href="/admin"
                                className={styles.secondaryButton}
                            />
                        ) : (
                            <BaseButton
                                label="Join Community"
                                href="/volunteer"
                                className={styles.secondaryButton}
                            />
                        )}

                        <BaseButton
                            label="Sign Out"
                            onClick={handleSignOut}
                            className={styles.primaryButton}
                        />
                    </div>
                </div>
            </header>

            <div className={styles.contentPanel}>
                <div
                    className={`${styles.contentRow} ${styles.detailsContentRow}`}
                >
                    <div
                        className={`${styles.contentBackground} ${styles.detailsCardPanel} ${
                            !userHasDonor && showDonorLinkForm
                                ? styles.detailsCardPanelLockedHeight
                                : ''
                        }`}
                    >
                        <div
                            className={`${styles.cardColumn} ${styles.detailsCardColumn} ${styles.detailsCardMobileLast}`}
                        >
                            {!userHasDonor && showDonorLinkForm ? (
                                <>
                                    <div
                                        className={styles.detailsLinkFormHeader}
                                    >
                                        <div
                                            className={
                                                styles.detailsLinkFormCopy
                                            }
                                        >
                                            <p
                                                className={
                                                    styles.detailsAlreadyMemberText
                                                }
                                            >
                                                Connect your ActBlue account
                                            </p>
                                            <p
                                                className={
                                                    styles.detailsLinkFormSubtitle
                                                }
                                            >
                                                Check the email you used to
                                                donate and input the order
                                                number so we can link your
                                                account and ship your card.
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowDonorLinkForm(false)
                                            }
                                            className={
                                                styles.detailsCloseButton
                                            }
                                            aria-label="Close connect ActBlue form"
                                        >
                                            <IoClose size={20} />
                                        </button>
                                    </div>
                                    <form
                                        className={`${styles.linkActBlueFormContainer} ${styles.detailsLinkForm}`}
                                        onSubmit={submitLinkForm}
                                    >
                                        <div
                                            className={`${styles.linkActBlueFormInputContainer} ${styles.detailsLinkFormInputs}`}
                                        >
                                            <label>
                                                <span
                                                    className={
                                                        formFieldStyles.fieldLabel
                                                    }
                                                >
                                                    Email Address
                                                </span>
                                                <input
                                                    className={
                                                        formFieldStyles.textField
                                                    }
                                                    value={
                                                        donorLinkForm.donorEmail
                                                    }
                                                    onChange={
                                                        handleChangeDonorEmail
                                                    }
                                                />
                                            </label>
                                            <label>
                                                <span
                                                    className={
                                                        formFieldStyles.fieldLabel
                                                    }
                                                >
                                                    ActBlue Order Number
                                                </span>
                                                <input
                                                    className={
                                                        formFieldStyles.textField
                                                    }
                                                    value={
                                                        donorLinkForm.orderId
                                                    }
                                                    onChange={
                                                        handleChangeOrderId
                                                    }
                                                />
                                            </label>
                                        </div>
                                        {donorLinkError && (
                                            <span
                                                className={
                                                    styles.linkActBlueFormErrorText
                                                }
                                            >
                                                {donorLinkError.message}
                                            </span>
                                        )}
                                        <div
                                            className={
                                                styles.detailsLinkSubmitRow
                                            }
                                        >
                                            <button
                                                type="submit"
                                                className={formStyles.button}
                                            >
                                                Link
                                            </button>
                                        </div>
                                    </form>
                                </>
                            ) : (
                                <>
                                    <div
                                        className={styles.detailsMembershipCta}
                                    >
                                        <div
                                            className={
                                                styles.detailsMembershipCopy
                                            }
                                        >
                                            <h3
                                                className={
                                                    styles.detailsMembershipHeading
                                                }
                                            >
                                                Dues Paying Membership
                                            </h3>
                                            <p
                                                className={
                                                    styles.detailsMembershipSubtitle
                                                }
                                            >
                                                Get your membership card
                                            </p>
                                        </div>
                                        <BaseButton
                                            href="https://secure.actblue.com/donate/pvmember?refcode=Account%20Page"
                                            label="Become a Member"
                                            className={styles.primaryButton}
                                        />
                                    </div>
                                    <div className={styles.cardColumnInner}>
                                        <InteractiveThreeCard
                                            dynamic
                                            backImage="/images/membercard_back.png"
                                        />
                                    </div>
                                    {userHasDonor && (
                                        <div
                                            className={
                                                styles.detailsMembershipStatusPanel
                                            }
                                        >
                                            {hasActiveRecurringPvMemberContribution ? (
                                                <>
                                                    <div
                                                        className={
                                                            formFieldStyles.fieldHeader
                                                        }
                                                    >
                                                        <span
                                                            className={
                                                                formFieldStyles.fieldLabel
                                                            }
                                                        >
                                                            Membership Card
                                                        </span>
                                                        <div
                                                            className={
                                                                formFieldStyles.fieldValue
                                                            }
                                                        >
                                                            <div
                                                                className={
                                                                    formFieldStyles.readonly
                                                                }
                                                            >
                                                                {
                                                                    membershipDeliverableLabels[
                                                                        userData
                                                                            .membershipCardStatus
                                                                    ]
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div
                                                        className={
                                                            formFieldStyles.fieldHeader
                                                        }
                                                    >
                                                        <span
                                                            className={
                                                                formFieldStyles.fieldLabel
                                                            }
                                                        >
                                                            Membership Benefits
                                                        </span>
                                                        <div
                                                            className={
                                                                formFieldStyles.fieldValue
                                                            }
                                                        >
                                                            <div
                                                                className={
                                                                    formFieldStyles.readonly
                                                                }
                                                            >
                                                                {
                                                                    membershipDeliverableLabels[
                                                                        userData
                                                                            .membershipMerchStatus
                                                                    ]
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <div
                                                    className={
                                                        formFieldStyles.fieldHeader
                                                    }
                                                >
                                                    <span
                                                        className={
                                                            formFieldStyles.fieldLabel
                                                        }
                                                    >
                                                        Dues Paying Member
                                                    </span>
                                                    <div
                                                        className={
                                                            formFieldStyles.fieldValue
                                                        }
                                                    >
                                                        <div
                                                            className={
                                                                formFieldStyles.readonly
                                                            }
                                                        >
                                                            {userData.duesPayingMember
                                                                ? 'Yes'
                                                                : 'No'}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {!userHasDonor && (
                                        <div
                                            className={`${styles.detailsMembershipCta} ${styles.detailsConnectCta}`}
                                        >
                                            <div
                                                className={
                                                    styles.detailsMembershipCopy
                                                }
                                            >
                                                <p
                                                    className={
                                                        styles.detailsAlreadyMemberText
                                                    }
                                                >
                                                    Already a member?
                                                </p>
                                                <p
                                                    className={
                                                        styles.detailsConnectSubtitle
                                                    }
                                                >
                                                    Connect your ActBlue to
                                                    check the status of your
                                                    membership benefits
                                                </p>
                                            </div>
                                            <BaseButton
                                                label="Link ActBlue"
                                                onClick={() =>
                                                    setShowDonorLinkForm(true)
                                                }
                                                className={`${styles.secondaryButton} ${styles.buttonHover}`}
                                            />
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    <div className={styles.detailsFormPanel}>
                        <AccountInfoForm
                            user={userData}
                            onSave={onSave}
                            hasMatchedDonor={userHasDonor}
                            showShirtSize={
                                hasRecurringPvMemberContributionAtOrAboveThreshold
                            }
                            subtitle={
                                userData.discordUsers?.[0]?.username
                                    ? `@${userData.discordUsers[0].username}`
                                    : undefined
                            }
                            avatar={
                                <DiscordAvatar
                                    discordUserId={
                                        userData.discordUsers?.[0]?.id
                                    }
                                    imageId={userData.discordUsers?.[0]?.image}
                                    size={48}
                                />
                            }
                            title={
                                `${userData.firstName ?? ''} ${userData.lastName ?? ''}`.trim() ||
                                'Account'
                            }
                        />
                    </div>
                </div>
            </div>

            {showAddressConfirmModal && (
                <div
                    className={styles.detailsModalBackdrop}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Confirm address"
                >
                    <div className={styles.detailsModalCard}>
                        <div className={styles.detailsLinkFormHeader}>
                            <div className={styles.detailsLinkFormCopy}>
                                <p className={styles.detailsAlreadyMemberText}>
                                    Confirm your address
                                </p>
                                <p className={styles.detailsLinkFormSubtitle}>
                                    We found a donor match. Please confirm this
                                    mailing address.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() =>
                                    setShowAddressConfirmModal(false)
                                }
                                className={styles.detailsCloseButton}
                                aria-label="Close address confirmation"
                            >
                                <IoClose size={20} />
                            </button>
                        </div>

                        <form
                            className={`${styles.linkActBlueFormContainer} ${styles.detailsLinkForm}`}
                            onSubmit={submitAddressConfirmation}
                        >
                            <div
                                className={`${styles.linkActBlueFormInputContainer} ${styles.detailsLinkFormInputs}`}
                            >
                                <label>
                                    <span
                                        className={formFieldStyles.fieldLabel}
                                    >
                                        Address Line 1
                                    </span>
                                    <input
                                        className={formFieldStyles.textField}
                                        value={addressDraft.addressLine1 ?? ''}
                                        onChange={(e) =>
                                            updateAddressDraft(
                                                'addressLine1',
                                                e.target.value
                                            )
                                        }
                                    />
                                </label>
                                <label>
                                    <span
                                        className={formFieldStyles.fieldLabel}
                                    >
                                        Address Line 2
                                    </span>
                                    <input
                                        className={formFieldStyles.textField}
                                        value={addressDraft.addressLine2 ?? ''}
                                        onChange={(e) =>
                                            updateAddressDraft(
                                                'addressLine2',
                                                e.target.value
                                            )
                                        }
                                    />
                                </label>
                                <label>
                                    <span
                                        className={formFieldStyles.fieldLabel}
                                    >
                                        City
                                    </span>
                                    <input
                                        className={formFieldStyles.textField}
                                        value={addressDraft.city ?? ''}
                                        onChange={(e) =>
                                            updateAddressDraft(
                                                'city',
                                                e.target.value
                                            )
                                        }
                                    />
                                </label>
                                <label>
                                    <span
                                        className={formFieldStyles.fieldLabel}
                                    >
                                        State
                                    </span>
                                    <input
                                        className={formFieldStyles.textField}
                                        value={addressDraft.state ?? ''}
                                        onChange={(e) =>
                                            updateAddressDraft(
                                                'state',
                                                e.target.value
                                            )
                                        }
                                    />
                                </label>
                                <label>
                                    <span
                                        className={formFieldStyles.fieldLabel}
                                    >
                                        Zip
                                    </span>
                                    <input
                                        className={formFieldStyles.textField}
                                        value={addressDraft.zip ?? ''}
                                        onChange={(e) =>
                                            updateAddressDraft(
                                                'zip',
                                                e.target.value
                                            )
                                        }
                                    />
                                </label>
                            </div>

                            <div className={styles.detailsModalActions}>
                                <button
                                    type="submit"
                                    className={`${styles.secondaryButton} ${styles.detailsConfirmAddressButton}`}
                                >
                                    Confirm Address
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </section>
    )
}
