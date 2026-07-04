'use client'

import styles from '@/app/account/account.module.css'
import formFieldStyles from '@/components/common/forms/FormField.module.css'
import { FormEvent } from 'react'
import { IoClose } from 'react-icons/io5'

export interface AddressDraft {
    addressLine1: string | null
    addressLine2: string | null
    city: string | null
    state: string | null
    zip: string | null
}

interface AddressConfirmationModalProps {
    isOpen: boolean
    addressDraft: AddressDraft
    onClose: () => void
    onSubmit: (e: FormEvent) => void
    onChangeAddressDraft: (field: keyof AddressDraft, value: string) => void
}

export function AddressConfirmationModal({
    isOpen,
    addressDraft,
    onClose,
    onSubmit,
    onChangeAddressDraft,
}: AddressConfirmationModalProps) {
    if (!isOpen) return null

    return (
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
                            <span className={formFieldStyles.fieldLabel}>
                                City
                            </span>
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
                                    onChangeAddressDraft(
                                        'state',
                                        e.target.value
                                    )
                                }
                            />
                        </label>
                        <label>
                            <span className={formFieldStyles.fieldLabel}>
                                Zip
                            </span>
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
                            Confirm Address
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
