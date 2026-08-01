'use client'

import InteractiveThreeCard from '../../home/MemberBanner'
import { AccountInfoForm } from '../AccountInfoForm'
import { ConfirmModal, NameDraft } from './ConfirmModal'
import styles from '@/app/account/account.module.css'
import { DiscordAvatar } from '@/components/common'
import { BaseButton } from '@/components/common/buttons/Button'
import formStyles from '@/components/common/forms/Form.module.css'
import formFieldStyles from '@/components/common/forms/FormField.module.css'
import { MembershipDeliverableStatus, User } from '@/contracts/data'
import { zDiscordUserIsInServerResponse } from '@/contracts/responses'
import { useFetch } from '@/util/hooks'
import { skipToken, useQuery } from '@tanstack/react-query'
import cx from 'classnames'
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
    const { ready, onGet } = useFetch()
    const [updatedUser, setUpdatedUser] = useState(userData)
    const discordUserId = userData.discordUsers?.[0]?.id ?? null

    const isInServerResult = useQuery({
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

    useEffect(() => {
        setUpdatedUser(userData)
    }, [userData])

    const membershipDeliverableLabels: Record<
        MembershipDeliverableStatus,
        string
    > = {
        [MembershipDeliverableStatus.NotStarted]: 'Not Started',
        [MembershipDeliverableStatus.Cancelled]: 'Cancelled',
        [MembershipDeliverableStatus.Printed]: 'Printed',
        [MembershipDeliverableStatus.Shipped]: 'Shipped',
        [MembershipDeliverableStatus.Received]: 'Received',
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

    const hasActiveRecurringContribution =
        userData.donors?.some((donor) =>
            (donor.contributions ?? []).some((contribution) => {
                return (
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
    const [nameDraft, setNameDraft] = useState<NameDraft>({
        firstName: userData.firstName ?? '',
        lastName: userData.lastName ?? '',
        phone: userData.phone ?? '',
        shirtSize: userData.shirtSize ?? null,
    })
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
        setShowDonorLinkForm(false)
        setShowAddressConfirmModal(true)
    }

    const renderDonorLinkForm = () => {
        return (
            <form
                className={cx(
                    styles.linkActBlueFormContainer,
                    styles.detailsLinkForm
                )}
                onSubmit={submitLinkForm}
            >
                <div
                    className={cx(
                        styles.linkActBlueFormInputContainer,
                        styles.detailsLinkFormInputs
                    )}
                >
                    <label>
                        <span className={formFieldStyles.fieldLabel}>
                            Email Address
                        </span>
                        <input
                            className={formFieldStyles.textField}
                            value={donorLinkForm.donorEmail}
                            onChange={handleChangeDonorEmail}
                        />
                    </label>
                    <label>
                        <span className={formFieldStyles.fieldLabel}>
                            ActBlue Order Number
                        </span>
                        <input
                            className={formFieldStyles.textField}
                            value={donorLinkForm.orderId}
                            onChange={handleChangeOrderId}
                        />
                    </label>
                </div>
                {donorLinkError && (
                    <span className={styles.linkActBlueFormErrorText}>
                        {donorLinkError.message}
                    </span>
                )}
                <div className={styles.detailsLinkSubmitRow}>
                    <button type="submit" className={formStyles.button}>
                        Link
                    </button>
                </div>
            </form>
        )
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

    const handleConfirmName = (draft: NameDraft) => {
        setNameDraft(draft)
    }

    const updateNameDraft = (field: keyof NameDraft, value: string) => {
        setNameDraft((prev) => ({ ...prev, [field]: value }))
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
            firstName: nameDraft.firstName,
            lastName: nameDraft.lastName,
            phone: nameDraft.phone || null,
            shirtSize: nameDraft.shirtSize,
            nameConfirmed: true,
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
        onDonorLinkSubmit(donorLinkForm)
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
                        ) : isInServerResult.data?.isInServer === false ? (
                            <BaseButton
                                label="Join Community"
                                href="/volunteer"
                                className={styles.secondaryButton}
                            />
                        ) : null}

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
                    className={cx(styles.contentRow, styles.detailsContentRow)}
                >
                    <div
                        className={cx(
                            styles.contentBackground,
                            styles.detailsCardPanel,
                            !userHasDonor &&
                                showDonorLinkForm &&
                                styles.detailsCardPanelLockedHeight
                        )}
                    >
                        <div
                            className={cx(
                                styles.cardColumn,
                                styles.detailsCardColumn,
                                styles.detailsCardMobileLast
                            )}
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
                                                <span
                                                    className={
                                                        styles.detailsLinkFormAlertText
                                                    }
                                                >
                                                    Check the email you used to
                                                    donate or log into ACTBLUE
                                                </span>{' '}
                                                to find and paste the order
                                                number of any donation to PV so
                                                we can link your account and
                                                ship your card.
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
                                    {renderDonorLinkForm()}
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
                                            href={
                                                discordUserId
                                                    ? `https://secure.actblue.com/donate/pvmember?refcode=Account%20Page&refcode2=${discordUserId}`
                                                    : 'https://secure.actblue.com/donate/pvmember?refcode=Account%20Page'
                                            }
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
                                            {userData.duesPayingMember &&
                                            hasActiveRecurringContribution ? (
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
                                                <>
                                                    <div
                                                        className={
                                                            styles.membershipStatusIndicatorContainer
                                                        }
                                                    >
                                                        <span>
                                                            Dues Paying Member:
                                                        </span>
                                                        <div>
                                                            <div
                                                                className={
                                                                    styles.membershipStatus
                                                                }
                                                            >
                                                                {userData.duesPayingMember
                                                                    ? 'Yes'
                                                                    : 'No'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <p
                                                        className={
                                                            styles.membershipStatusManualNotice
                                                        }
                                                    >
                                                        This must be set
                                                        manually, please check
                                                        back later.
                                                    </p>
                                                    <p
                                                        className={
                                                            styles.membershipStatusManualNotice
                                                        }
                                                    >
                                                        If it remains incorrect,
                                                        please{' '}
                                                        <a
                                                            href="https://www.progressivevictory.win/membership_support"
                                                            className={
                                                                styles.membershipStatusManualNoticeLink
                                                            }
                                                        >
                                                            click here
                                                        </a>{' '}
                                                        for support.
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                    )}
                                    {!userHasDonor && (
                                        <div
                                            className={cx(
                                                styles.detailsMembershipCta,
                                                styles.detailsConnectCta
                                            )}
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
                                                className={cx(
                                                    styles.secondaryButton,
                                                    styles.buttonHover
                                                )}
                                            />
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    <div className={styles.detailsFormPanel}>
                        <AccountInfoForm
                            user={updatedUser}
                            onSave={onSave}
                            onUpdateUser={setUpdatedUser}
                            hasMatchedDonor={userHasDonor}
                            showShirtSize={
                                hasRecurringPvMemberContributionAtOrAboveThreshold
                            }
                            subtitle={
                                updatedUser.discordUsers?.[0]?.username
                                    ? `@${updatedUser.discordUsers[0].username}`
                                    : undefined
                            }
                            avatar={
                                <DiscordAvatar
                                    discordUserId={
                                        updatedUser.discordUsers?.[0]?.id
                                    }
                                    imageId={
                                        updatedUser.discordUsers?.[0]?.image
                                    }
                                    size={48}
                                />
                            }
                            title={
                                `${updatedUser.firstName ?? ''} ${updatedUser.lastName ?? ''}`.trim() ||
                                'Account'
                            }
                        />
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={showAddressConfirmModal}
                nameDraft={nameDraft}
                addressDraft={addressDraft}
                onClose={() => setShowAddressConfirmModal(false)}
                onSubmitAddress={submitAddressConfirmation}
                onConfirmName={handleConfirmName}
                onChangeNameDraft={updateNameDraft}
                onChangeAddressDraft={updateAddressDraft}
            />
        </section>
    )
}
