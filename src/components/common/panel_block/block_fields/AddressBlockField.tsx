import { useInfoBlockContext } from '../Block'
import blockFieldStyles from './BlockField.module.css'
import { InformationCircleIcon } from '@heroicons/react/24/outline'

export function AddressBlockField() {
    const { user, draft, editing, onDraftChange } = useInfoBlockContext()
    const { address: origAddress } = user

    const origLine1 = origAddress.addressLine1?.trim()
    const origLine2 = origAddress.addressLine2?.trim()
    const origCity = origAddress.city?.trim()
    const origState = origAddress.state?.trim()
    const origZip = origAddress.zip?.trim()

    const cityState = [origCity, origState].filter(Boolean).join(', ')
    const cityStateZip = [cityState, origZip].filter(Boolean).join(' ')
    const fullAddressLines = [origLine1, origLine2, cityStateZip].filter(
        Boolean
    )

    if (editing) {
        const { address: draftAddress } = draft
        return (
            <>
                <div className={blockFieldStyles.infoBlockFieldRow}>
                    <span className={blockFieldStyles.infoBlockFieldLabel}>
                        Address Line 1
                    </span>
                    <input
                        className={blockFieldStyles.infoBlockFieldInput}
                        value={draftAddress.addressLine1 ?? ''}
                        placeholder={origLine1 ?? 'Empty'}
                        onChange={(e) =>
                            onDraftChange((u) => ({
                                ...u,
                                address: {
                                    ...u.address,
                                    addressLine1: e.target.value.trim() || null,
                                },
                            }))
                        }
                        aria-label="Address line 1"
                    />
                </div>
                <div className={blockFieldStyles.infoBlockFieldRow}>
                    <span className={blockFieldStyles.infoBlockFieldLabel}>
                        Address Line 2
                    </span>
                    <input
                        className={blockFieldStyles.infoBlockFieldInput}
                        value={draftAddress.addressLine2 ?? ''}
                        placeholder={origLine2 ?? 'Empty'}
                        onChange={(e) =>
                            onDraftChange((u) => ({
                                ...u,
                                address: {
                                    ...u.address,
                                    addressLine2: e.target.value.trim() || null,
                                },
                            }))
                        }
                        aria-label="Address line 2"
                    />
                </div>
                <div className={blockFieldStyles.infoBlockFieldRow}>
                    <span className={blockFieldStyles.infoBlockFieldLabel}>
                        City
                    </span>
                    <input
                        className={blockFieldStyles.infoBlockFieldInput}
                        value={draftAddress.city ?? ''}
                        placeholder={origCity ?? 'Empty'}
                        onChange={(e) =>
                            onDraftChange((u) => ({
                                ...u,
                                address: {
                                    ...u.address,
                                    city: e.target.value.trim() || null,
                                },
                            }))
                        }
                        aria-label="City"
                    />
                </div>
                <div className={blockFieldStyles.infoBlockFieldRow}>
                    <span className={blockFieldStyles.infoBlockFieldLabel}>
                        State
                    </span>
                    <input
                        className={blockFieldStyles.infoBlockFieldInput}
                        value={draftAddress.state ?? ''}
                        placeholder={origState ?? 'Empty'}
                        onChange={(e) =>
                            onDraftChange((u) => ({
                                ...u,
                                address: {
                                    ...u.address,
                                    state:
                                        e.target.value
                                            .trim()
                                            .toUpperCase()
                                            .slice(0, 2) || null,
                                },
                            }))
                        }
                        aria-label="State"
                    />
                </div>
                <div className={blockFieldStyles.infoBlockFieldRow}>
                    <span className={blockFieldStyles.infoBlockFieldLabel}>
                        Zip
                    </span>
                    <input
                        className={blockFieldStyles.infoBlockFieldInput}
                        value={draftAddress.zip ?? ''}
                        placeholder={origZip ?? 'Empty'}
                        onChange={(e) => {
                            const digits = e.target.value.replace(/\D/g, '')
                            onDraftChange((u) => ({
                                ...u,
                                address: {
                                    ...u.address,
                                    zip: digits
                                        ? digits.padStart(5, '0').slice(-5)
                                        : null,
                                },
                            }))
                        }}
                        aria-label="Zip"
                    />
                </div>
            </>
        )
    }

    return (
        <>
            <div
                className={`${blockFieldStyles.infoBlockFieldRow} ${blockFieldStyles.infoBlockFieldRowMultiline}`}
            >
                <span className={blockFieldStyles.infoBlockFieldLabel}>
                    Full Address
                </span>
                <button
                    type="button"
                    className={`${blockFieldStyles.infoBlockInfoButton} ${blockFieldStyles.infoBlockInfoButtonMultiline}`}
                    aria-label="Full address info"
                >
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-end',
                            gap: '0.1rem',
                        }}
                    >
                        {fullAddressLines.length > 0 ? (
                            fullAddressLines.map((line, index) => (
                                <span
                                    key={`${line}-${index}`}
                                    className={`${blockFieldStyles.infoBlockFieldValue} ${blockFieldStyles.infoBlockFieldValueLine}`}
                                >
                                    {line}
                                </span>
                            ))
                        ) : (
                            <span
                                className={blockFieldStyles.infoBlockFieldValue}
                            >
                                -
                            </span>
                        )}
                    </div>
                    <InformationCircleIcon
                        className={blockFieldStyles.infoBlockInfoIcon}
                    />
                </button>
            </div>
        </>
    )
}
