'use client'

import { ListRow, type ListRowBaseProps } from '../ListRow'
import { useListField, type ListRowFieldProps } from '../useListField'
import styles from './AddressRow.module.css'
import { PickerEditor } from './PickerRow'
import { TextRow } from './TextRow'
import fields from './fields.module.css'
import { CloseCircleIcon } from '@/components/common/icons/CloseCircleIcon'
import { getStateFromZip, stateOptions } from '@/models'
import { cn } from '@/util'
import { useEffect, useRef, useState } from 'react'

export interface ListRowAddress {
    addressLine1?: string | null
    addressLine2?: string | null
    city?: string | null
    county?: string | null
    state?: string | null
    zip?: string | null
}

const ZIP_LENGTH = 5

const nonEmpty = (text?: string | null) => (text?.length ? text : undefined)

const isAddressEmpty = (address?: ListRowAddress | null) =>
    ![
        address?.addressLine1,
        address?.addressLine2,
        address?.city,
        address?.county,
        address?.state,
        address?.zip,
    ].some((part) => part?.trim())

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
    location?: ZipLocation | null
    invalidZip?: string | null
    onClearedCountyChange: (county: string) => void
}

interface ZipLocation {
    zip: number
    city: string
    county?: string
    state: string
}

function AddressEditor({
    labelId,
    value,
    onValueChange,
    location,
    invalidZip,
    onClearedCountyChange,
}: AddressEditorProps) {
    const [cleared, setCleared] = useState<ListRowAddress>({})
    const [zipCleared, setZipCleared] = useState<ListRowAddress | null>(null)
    const expectedCounty = useRef(value?.county ?? '')
    const [zipChanged, setZipChanged] = useState(false)
    const otherFieldsEdited = useRef(false)
    const stateOtherFieldsEdited = useRef(false)
    const countyEdited = useRef(false)
    const update = (patch: ListRowAddress) => {
        if ('county' in patch) expectedCounty.current = patch.county ?? ''
        onValueChange?.({ ...value, ...patch })
    }
    const updateOther = (patch: ListRowAddress) => {
        otherFieldsEdited.current = true
        stateOtherFieldsEdited.current = true
        update(patch)
    }
    const partial = !isAddressEmpty(value)
    const matchesLocation =
        location &&
        value?.zip === String(location.zip).padStart(ZIP_LENGTH, '0')
    const stateMismatch = Boolean(
        matchesLocation &&
        value?.state?.trim() &&
        value.state.trim().toLowerCase() !== location.state.trim().toLowerCase()
    )
    const cityMismatch = Boolean(
        matchesLocation &&
        value?.city?.trim() &&
        value.city.trim().toLowerCase() !== location.city.trim().toLowerCase()
    )
    const countyMismatch = Boolean(
        matchesLocation &&
        value?.county?.trim() &&
        location.county?.trim() &&
        value.county.trim().toLowerCase() !==
            location.county.trim().toLowerCase()
    )
    const mismatches = [
        cityMismatch && 'city',
        stateMismatch && 'state',
        countyMismatch && 'county',
    ].filter((field): field is string => typeof field === 'string')
    let zipError: string | undefined
    if (zipChanged && value?.zip?.length === ZIP_LENGTH) {
        if (value.zip === invalidZip) zipError = 'ZIP code not valid'
        else if (mismatches.length)
            zipError = `ZIP code does not match ${new Intl.ListFormat('en', { type: 'conjunction' }).format(mismatches)}`
    }

    useEffect(() => {
        if ((value?.county ?? '') !== expectedCounty.current) {
            countyEdited.current = true
            otherFieldsEdited.current = true
            stateOtherFieldsEdited.current = true
        }
    }, [value?.county])

    useEffect(() => () => onClearedCountyChange(''), [onClearedCountyChange])

    useEffect(() => {
        if (!zipChanged || !location || !value) return
        if (value.zip !== String(location.zip).padStart(ZIP_LENGTH, '0')) return
        if (value.zip === invalidZip) return
        const state = otherFieldsEdited.current ? value.state : location.state
        const city = otherFieldsEdited.current ? value.city : location.city
        const county =
            !countyEdited.current &&
            !(otherFieldsEdited.current && (stateMismatch || cityMismatch))
                ? (location.county ?? value.county)
                : value.county
        if (
            state !== value.state ||
            city !== value.city ||
            county !== value.county
        ) {
            expectedCounty.current = county ?? ''
            onValueChange?.({ ...value, state, city, county })
        }
    }, [
        zipChanged,
        location,
        value,
        onValueChange,
        invalidZip,
        stateMismatch,
        cityMismatch,
    ])

    const changeState = (state: string) => {
        if (state !== value?.state) {
            otherFieldsEdited.current = true
        }
        if (stateOtherFieldsEdited.current) return update({ state })
        const fields = {
            addressLine1: value?.addressLine1,
            addressLine2: value?.addressLine2,
            city: value?.city,
            county: value?.county,
            zip: value?.zip,
        }
        const hasNewValues = Object.values(fields).some(
            (field) => nonEmpty(field) !== undefined
        )

        if (!hasNewValues && cleared.state === state) {
            update(cleared)
            setCleared({})
            onClearedCountyChange('')
            return
        }

        const addressState = value?.state ?? getStateFromZip(value?.zip)
        if (!addressState || addressState === state) return update({ state })

        if (hasNewValues) setCleared({ ...fields, state: addressState })
        onClearedCountyChange(value?.county ?? '')
        update({
            state,
            addressLine1: null,
            addressLine2: null,
            city: null,
            county: null,
            zip: null,
        })
    }

    const changeZip = (input: string) => {
        const zip = input.replace(/\D/g, '').slice(0, ZIP_LENGTH)
        if (zip === (value?.zip ?? '')) return
        stateOtherFieldsEdited.current = true
        if (!otherFieldsEdited.current) {
            if (zipCleared && zip === (zipCleared.zip ?? '')) {
                setZipChanged(false)
                update({ ...zipCleared, zip: zip || null })
                setCleared({})
                setZipCleared(null)
                onClearedCountyChange('')
                return
            }
            if (!zipCleared && zip !== (value?.zip ?? '')) {
                setZipChanged(true)
                const previous = {
                    addressLine1: value?.addressLine1,
                    addressLine2: value?.addressLine2,
                    city: value?.city,
                    county: value?.county,
                    state: value?.state,
                    zip: value?.zip,
                }
                setCleared(previous)
                setZipCleared(previous)
                onClearedCountyChange(value?.county ?? '')
                update({
                    addressLine1: null,
                    addressLine2: null,
                    city: null,
                    county: null,
                    state: null,
                    zip: zip || null,
                })
                return
            }
        }
        setZipChanged(true)
        update({ zip: zip || null })
    }

    return (
        <div role="group" aria-labelledby={labelId} className={styles.editor}>
            <input
                type="text"
                aria-label="Address Line 1"
                placeholder={nonEmpty(cleared.addressLine1) ?? 'Address Line 1'}
                autoComplete="address-line1"
                value={value?.addressLine1 ?? ''}
                onChange={(event) =>
                    updateOther({
                        addressLine1: event.target.value.slice(0, 100),
                    })
                }
                className={cn(
                    fields.textField,
                    partial && !value?.addressLine1?.trim() && styles.warning
                )}
            />
            <input
                type="text"
                aria-label="Address Line 2"
                placeholder={nonEmpty(cleared.addressLine2) ?? 'Address Line 2'}
                autoComplete="address-line2"
                value={value?.addressLine2 ?? ''}
                onChange={(event) =>
                    updateOther({
                        addressLine2: event.target.value.slice(0, 100),
                    })
                }
                className={cn(
                    fields.textField,
                    partial && !value?.addressLine2?.trim() && styles.warning
                )}
            />
            <div className={styles.region}>
                <input
                    type="text"
                    aria-label="City"
                    placeholder={nonEmpty(cleared.city) ?? 'City'}
                    autoComplete="address-level2"
                    value={value?.city ?? ''}
                    onChange={(event) => {
                        updateOther({ city: event.target.value.slice(0, 50) })
                    }}
                    className={cn(
                        fields.textField,
                        partial && !value?.city?.trim() && styles.warning
                    )}
                />
                <PickerEditor
                    value={value?.state}
                    options={stateOptions}
                    placeholder="Select state"
                    triggerLabel={value?.state ?? 'State'}
                    triggerClassName={cn(
                        styles.stateTrigger,
                        partial && !value?.state?.trim() && styles.warning
                    )}
                    onValueChange={(state) => changeState(String(state))}
                />
                <div
                    className={cn(
                        styles.zipField,
                        zipError && styles.zipInvalid
                    )}
                >
                    <input
                        type="text"
                        inputMode="numeric"
                        aria-label="Zip Code"
                        aria-invalid={!!zipError}
                        placeholder={nonEmpty(cleared.zip) ?? 'Zip'}
                        autoComplete="postal-code"
                        value={value?.zip ?? ''}
                        onChange={(event) => changeZip(event.target.value)}
                        className={cn(
                            fields.textField,
                            partial &&
                                value?.zip?.length !== ZIP_LENGTH &&
                                styles.warning
                        )}
                    />
                    {zipError && (
                        <button
                            type="button"
                            aria-label={`${zipError}. Clear ZIP code`}
                            title={zipError}
                            className={styles.zipClear}
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => changeZip('')}
                        >
                            <CloseCircleIcon />
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export interface AddressRowProps
    extends ListRowBaseProps, ListRowFieldProps<ListRowAddress> {
    location?: ZipLocation | null
    invalidZip?: string | null
    showCounty?: boolean
}

export function AddressRow({
    value: valueProp,
    onValueChange: onValueChangeProp,
    field,
    getter,
    setter,
    validator,
    location,
    invalidZip,
    showCounty = false,
    labelAlign = 'top',
    className,
    ...rowProps
}: AddressRowProps) {
    const [clearedCounty, setClearedCounty] = useState('')
    const { value, onValueChange, invalid } = useListField<ListRowAddress>(
        {
            value: valueProp,
            onValueChange: onValueChangeProp,
            field,
            getter,
            setter,
            validator,
        },
        {
            required: rowProps.indicator === 'required',
            isEmpty: isAddressEmpty,
            editing: rowProps.editing,
        }
    )
    const formattedAddress = formatAddress(value)
    return (
        <>
            <ListRow
                {...rowProps}
                invalid={invalid && isAddressEmpty(value)}
                labelAlign={labelAlign}
                className={cn(styles.row, className)}
                value={
                    formattedAddress && (
                        <span className={styles.multiline}>
                            {formattedAddress}
                        </span>
                    )
                }
                editor={(labelId) => (
                    <AddressEditor
                        labelId={labelId}
                        value={value}
                        onValueChange={onValueChange}
                        location={location}
                        invalidZip={invalidZip}
                        onClearedCountyChange={setClearedCounty}
                    />
                )}
            />
            {showCounty && (
                <TextRow
                    {...rowProps}
                    label="County"
                    indicator={undefined}
                    className={cn(
                        invalid &&
                            isAddressEmpty(value) &&
                            styles.countyInvalid,
                        !isAddressEmpty(value) &&
                            !value?.county?.trim() &&
                            styles.countyWarning
                    )}
                    placeholder={nonEmpty(clearedCounty) ?? 'County'}
                    value={value?.county ?? ''}
                    onValueChange={(county) =>
                        onValueChange({ ...value, county: county.slice(0, 50) })
                    }
                />
            )}
        </>
    )
}
