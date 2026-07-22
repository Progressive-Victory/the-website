'use client'

import styles from '@/app/account/account.module.css'
import formFieldStyles from '@/components/common/forms/FormField.module.css'
import { ShirtSize } from '@/contracts/data'
import { FormEvent, useState } from 'react'
import { IoClose } from 'react-icons/io5'

export interface AddressDraft {
    addressLine1: string | null
    addressLine2: string | null
    city: string | null
    state: string | null
    zip: string | null
}

export interface NameDraft {
    firstName: string
    lastName: string
    phone: string
    shirtSize: ShirtSize | null
}

interface ConfirmModalProps {
    isOpen: boolean
    nameDraft: NameDraft
    addressDraft: AddressDraft
    onClose: () => void
    onSubmitAddress: (e: FormEvent) => void
    onConfirmName: (nameDraft: NameDraft) => void
    onChangeNameDraft: (field: keyof NameDraft, value: string) => void
    onChangeAddressDraft: (field: keyof AddressDraft, value: string) => void
}

function NameConfirmationPage({
    nameDraft,
    onClose,
    onConfirmName,
    onChangeNameDraft,
}: {
    nameDraft: NameDraft
    onClose: () => void
    onConfirmName: (nameDraft: NameDraft) => void
    onChangeNameDraft: (field: keyof NameDraft, value: string) => void
}) {
    return (
        <>
            <div className={styles.detailsLinkFormHeader}>
                <div className={styles.detailsLinkFormCopy}>
                    <p className={styles.detailsAlreadyMemberText}>
                        Confirm your name
                    </p>
                    <p className={styles.detailsLinkFormSubtitle}>
                        Please confirm your name for your membership card.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className={styles.detailsCloseButton}
                    aria-label="Close confirmation"
                >
                    <IoClose size={20} />
                </button>
            </div>

            <form
                className={`${styles.linkActBlueFormContainer} ${styles.detailsLinkForm}`}
                onSubmit={(e) => {
                    e.preventDefault()
                    onConfirmName(nameDraft)
                }}
            >
                <div
                    className={`${styles.linkActBlueFormInputContainer} ${styles.detailsLinkFormInputs}`}
                >
                    <label>
                        <span className={formFieldStyles.fieldLabel}>
                            First Name
                        </span>
                        <input
                            className={formFieldStyles.textField}
                            value={nameDraft.firstName}
                            onChange={(e) =>
                                onChangeNameDraft('firstName', e.target.value)
                            }
                        />
                    </label>
                    <label>
                        <span className={formFieldStyles.fieldLabel}>
                            Last Name
                        </span>
                        <input
                            className={formFieldStyles.textField}
                            value={nameDraft.lastName}
                            onChange={(e) =>
                                onChangeNameDraft('lastName', e.target.value)
                            }
                        />
                    </label>
                    <label>
                        <span className={formFieldStyles.fieldLabel}>
                            Phone Number
                        </span>
                        <input
                            className={formFieldStyles.textField}
                            type="tel"
                            value={nameDraft.phone}
                            onChange={(e) =>
                                onChangeNameDraft('phone', e.target.value)
                            }
                        />
                    </label>
                    <label>
                        <span className={formFieldStyles.fieldLabel}>
                            Shirt Size
                        </span>
                        <select
                            className={formFieldStyles.textField}
                            value={nameDraft.shirtSize ?? ''}
                            onChange={(e) =>
                                onChangeNameDraft('shirtSize', e.target.value)
                            }
                        >
                            <option value="">Select a size</option>
                            {Object.values(ShirtSize).map((size) => (
                                <option key={size} value={size}>
                                    {size}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                <div className={styles.detailsModalActions}>
                    <button
                        type="submit"
                        className={`${styles.secondaryButton} ${styles.detailsConfirmAddressButton}`}
                    >
                        Continue
                    </button>
                </div>
            </form>
        </>
    )
}

function AddressConfirmationPage({
    addressDraft,
    onClose,
    onSubmit,
    onChangeAddressDraft,
}: {
    addressDraft: AddressDraft
    onClose: () => void
    onSubmit: (e: FormEvent) => void
    onChangeAddressDraft: (field: keyof AddressDraft, value: string) => void
}) {
    return (
        <>
            <div className={styles.detailsLinkFormHeader}>
                <div className={styles.detailsLinkFormCopy}>
                    <p className={styles.detailsAlreadyMemberText}>
                        Confirm your address
                    </p>
                    <p className={styles.detailsLinkFormSubtitle}>
                        We found a donor match. Please confirm this mailing
                        address.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className={styles.detailsCloseButton}
                    aria-label="Close address confirmation"
                >
                    <IoClose size={20} />
                </button>
            </div>

            <form
                className={`${styles.linkActBlueFormContainer} ${styles.detailsLinkForm}`}
                onSubmit={onSubmit}
            >
                <div
                    className={`${styles.linkActBlueFormInputContainer} ${styles.detailsLinkFormInputs}`}
                >
                    <label>
                        <span className={formFieldStyles.fieldLabel}>
                            Address Line 1
                        </span>
                        <input
                            className={formFieldStyles.textField}
                            value={addressDraft.addressLine1 ?? ''}
                            onChange={(e) =>
                                onChangeAddressDraft(
                                    'addressLine1',
                                    e.target.value
                                )
                            }
                        />
                    </label>
                    <label>
                        <span className={formFieldStyles.fieldLabel}>
                            Address Line 2
                        </span>
                        <input
                            className={formFieldStyles.textField}
                            value={addressDraft.addressLine2 ?? ''}
                            onChange={(e) =>
                                onChangeAddressDraft(
                                    'addressLine2',
                                    e.target.value
                                )
                            }
                        />
                    </label>
                    <label>
                        <span className={formFieldStyles.fieldLabel}>City</span>
                        <input
                            className={formFieldStyles.textField}
                            value={addressDraft.city ?? ''}
                            onChange={(e) =>
                                onChangeAddressDraft('city', e.target.value)
                            }
                        />
                    </label>
                    <label>
                        <span className={formFieldStyles.fieldLabel}>
                            State
                        </span>
                        <input
                            className={formFieldStyles.textField}
                            value={addressDraft.state ?? ''}
                            onChange={(e) =>
                                onChangeAddressDraft('state', e.target.value)
                            }
                        />
                    </label>
                    <label>
                        <span className={formFieldStyles.fieldLabel}>Zip</span>
                        <input
                            className={formFieldStyles.textField}
                            value={addressDraft.zip ?? ''}
                            onChange={(e) =>
                                onChangeAddressDraft('zip', e.target.value)
                            }
                        />
                    </label>
                </div>

                <div className={styles.detailsModalActions}>
                    <button
                        type="submit"
                        className={`${styles.secondaryButton} ${styles.detailsConfirmAddressButton}`}
                    >
                        Connect ActBlue
                    </button>
                </div>
            </form>
        </>
    )
}

export function ConfirmModal({
    isOpen,
    nameDraft,
    addressDraft,
    onClose,
    onSubmitAddress,
    onConfirmName,
    onChangeNameDraft,
    onChangeAddressDraft,
}: ConfirmModalProps) {
    const [page, setPage] = useState<'name' | 'address'>('name')

    const handleClose = () => {
        setPage('name')
        onClose()
    }

    const handleConfirmName = (draft: NameDraft) => {
        onConfirmName(draft)
        setPage('address')
    }

    const handleSubmitAddress = (e: FormEvent) => {
        onSubmitAddress(e)
        setPage('name')
    }

    if (!isOpen) return null

    return (
        <div
            className={styles.detailsModalBackdrop}
            role="dialog"
            aria-modal="true"
            aria-label="Confirm information"
        >
            <div className={styles.detailsModalCard}>
                {page === 'name' ? (
                    <NameConfirmationPage
                        nameDraft={nameDraft}
                        onClose={handleClose}
                        onConfirmName={handleConfirmName}
                        onChangeNameDraft={onChangeNameDraft}
                    />
                ) : (
                    <AddressConfirmationPage
                        addressDraft={addressDraft}
                        onClose={handleClose}
                        onSubmit={handleSubmitAddress}
                        onChangeAddressDraft={onChangeAddressDraft}
                    />
                )}
            </div>
        </div>
    )
}
