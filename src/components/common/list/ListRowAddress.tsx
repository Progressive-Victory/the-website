import styles from './ListRow.module.css'
import { PickerEditor } from './ListRowPicker'
import { getStateFromZip, stateOptions } from '@/models'
import { useState } from 'react'

export interface ListRowAddress {
    addressLine1?: string | null
    addressLine2?: string | null
    city?: string | null
    state?: string | null
    zip?: string | null
}

const ZIP_LENGTH = 5

const nonEmpty = (text?: string | null) => (text?.length ? text : undefined)

export function formatAddress(address?: ListRowAddress | null) {
    if (!address) return ''
    const stateZip = [address.state, address.zip].filter(Boolean).join('  ')
    const cityStateZip = [address.city, stateZip].filter(Boolean).join(', ')
    return [address.addressLine1, address.addressLine2, cityStateZip]
        .filter(Boolean)
        .join('\n')
}

interface AddressEditorProps {
    labelId: string
    value?: ListRowAddress | null
    onValueChange?: (value: ListRowAddress) => void
}

export function AddressEditor({
    labelId,
    value,
    onValueChange,
}: AddressEditorProps) {
    const [cleared, setCleared] = useState<ListRowAddress>({})
    const update = (patch: ListRowAddress) =>
        onValueChange?.({ ...value, ...patch })

    const changeState = (state: string) => {
        const fields = {
            addressLine1: value?.addressLine1,
            addressLine2: value?.addressLine2,
            city: value?.city,
            zip: value?.zip,
        }
        const hasNewValues = Object.values(fields).some(
            (field) => nonEmpty(field) !== undefined
        )

        if (!hasNewValues && cleared.state === state) {
            update(cleared)
            setCleared({})
            return
        }

        const addressState = getStateFromZip(value?.zip) ?? value?.state
        if (!addressState || addressState === state) return update({ state })

        if (hasNewValues) setCleared({ ...fields, state: addressState })
        update({
            state,
            addressLine1: null,
            addressLine2: null,
            city: null,
            zip: null,
        })
    }

    return (
        <div
            role="group"
            aria-labelledby={labelId}
            className={styles.addressEditor}
        >
            <input
                type="text"
                aria-label="Address Line 1"
                placeholder={nonEmpty(cleared.addressLine1) ?? 'Address Line 1'}
                autoComplete="address-line1"
                value={value?.addressLine1 ?? ''}
                onChange={(event) =>
                    update({ addressLine1: event.target.value.slice(0, 100) })
                }
                className={styles.textField}
            />
            <input
                type="text"
                aria-label="Address Line 2"
                placeholder={nonEmpty(cleared.addressLine2) ?? 'Address Line 2'}
                autoComplete="address-line2"
                value={value?.addressLine2 ?? ''}
                onChange={(event) =>
                    update({ addressLine2: event.target.value.slice(0, 100) })
                }
                className={styles.textField}
            />
            <div className={styles.addressRegion}>
                <input
                    type="text"
                    aria-label="City"
                    placeholder={nonEmpty(cleared.city) ?? 'City'}
                    autoComplete="address-level2"
                    value={value?.city ?? ''}
                    onChange={(event) =>
                        update({ city: event.target.value.slice(0, 50) })
                    }
                    className={styles.textField}
                />
                <PickerEditor
                    value={value?.state}
                    options={stateOptions}
                    placeholder="Select state"
                    triggerLabel={value?.state ?? 'State'}
                    triggerClassName={styles.stateTrigger}
                    onValueChange={(state) => changeState(String(state))}
                />
                <input
                    type="text"
                    inputMode="numeric"
                    aria-label="Zip Code"
                    placeholder={nonEmpty(cleared.zip) ?? 'Zip'}
                    autoComplete="postal-code"
                    value={value?.zip ?? ''}
                    onChange={(event) =>
                        update({
                            zip:
                                event.target.value
                                    .replace(/\D/g, '')
                                    .slice(0, ZIP_LENGTH) || null,
                        })
                    }
                    className={styles.textField}
                />
            </div>
        </div>
    )
}
