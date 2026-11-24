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
    country?: string | null
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
        address?.country,
    ].some((part) => part?.trim())

export function formatAddress(address?: ListRowAddress | null) {
    if (!address) return ''
    const stateZip = [address.state, address.zip].filter(Boolean).join('  ')
    const cityStateZip = [address.city, stateZip].filter(Boolean).join(', ')
    return [
        address.addressLine1,
        address.addressLine2,
        cityStateZip,
        address.country,
    ]
        .filter(Boolean)
        .join('\n')
}

interface AddressEditorProps {
    labelId: string
    value?: ListRowAddress | null
    onValueChange?: (value: ListRowAddress) => void
    location?: ZipLocation | null
    invalidZip?: string | null
    showCountry: boolean
    onClearedCountyChange: (county: string) => void
}

interface ZipLocation {
    zip: number
    city: string
    county?: string
    state: string
}

const CLEARED_ADDRESS = {
    addressLine1: null,
    addressLine2: null,
    city: null,
    county: null,
    state: null,
    zip: null,
} satisfies ListRowAddress

const MISMATCH_FIELDS = ['city', 'state', 'county'] as const

const pickAddress = (value?: ListRowAddress | null): ListRowAddress => ({
    addressLine1: value?.addressLine1,
    addressLine2: value?.addressLine2,
    city: value?.city,
    county: value?.county,
    state: value?.state,
    zip: value?.zip,
})

const padZip = (zip: number) => String(zip).padStart(ZIP_LENGTH, '0')

const differs = (text: string | null | undefined, expected: string) =>
    Boolean(
        text?.trim() &&
        text.trim().toLowerCase() !== expected.trim().toLowerCase()
    )

function getMismatches(
    value?: ListRowAddress | null,
    location?: ZipLocation | null
) {
    if (!value || !location || value.zip !== padZip(location.zip))
        return { city: false, state: false, county: false }
    return {
        city: differs(value.city, location.city),
        state: differs(value.state, location.state),
        county:
            !!location.county?.trim() && differs(value.county, location.county),
    }
}

function getZipError(
    zipChanged: boolean,
    zip: string | null | undefined,
    invalidZip: string | null | undefined,
    mismatches: readonly string[]
) {
    if (!zipChanged || zip?.length !== ZIP_LENGTH) return undefined
    if (zip === invalidZip) return 'ZIP code not valid'
    if (!mismatches.length) return undefined
    return `ZIP code does not match ${new Intl.ListFormat('en', { type: 'conjunction' }).format(mismatches)}`
}

interface AddressInputProps {
    field: 'addressLine1' | 'addressLine2' | 'city' | 'country'
    label: string
    autoComplete: string
    maxLength: number
    value?: ListRowAddress | null
    cleared: ListRowAddress
    partial: boolean
    onValueChange: (patch: ListRowAddress) => void
}

function AddressInput({
    field,
    label,
    autoComplete,
    maxLength,
    value,
    cleared,
    partial,
    onValueChange,
}: AddressInputProps) {
    const text = value?.[field]
    return (
        <input
            type="text"
            aria-label={label}
            placeholder={nonEmpty(cleared[field]) ?? label}
            autoComplete={autoComplete}
            value={text ?? ''}
            onChange={(event) =>
                onValueChange({
                    [field]: event.target.value.slice(0, maxLength),
                })
            }
            className={cn(
                fields.textField,
                partial && !text?.trim() && styles.warning
            )}
        />
    )
}

interface ZipInputProps {
    value?: string | null
    placeholder?: string | null
    error?: string
    partial: boolean
    onValueChange: (zip: string) => void
}

function ZipInput({
    value,
    placeholder,
    error,
    partial,
    onValueChange,
}: ZipInputProps) {
    return (
        <div className={cn(styles.zipField, error && styles.zipInvalid)}>
            <input
                type="text"
                inputMode="numeric"
                aria-label="Zip Code"
                aria-invalid={!!error}
                placeholder={nonEmpty(placeholder) ?? 'Zip'}
                autoComplete="postal-code"
                value={value ?? ''}
                onChange={(event) => onValueChange(event.target.value)}
                className={cn(
                    fields.textField,
                    partial && value?.length !== ZIP_LENGTH && styles.warning
                )}
            />
            {error && (
                <button
                    type="button"
                    aria-label={`${error}. Clear ZIP code`}
                    title={error}
                    className={styles.zipClear}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => onValueChange('')}
                >
                    <CloseCircleIcon />
                </button>
            )}
        </div>
    )
}

function AddressEditor({
    labelId,
    value,
    onValueChange,
    location,
    invalidZip,
    showCountry,
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
    const mismatch = getMismatches(value, location)
    const mismatches = MISMATCH_FIELDS.filter((field) => mismatch[field])
    const zipError = getZipError(zipChanged, value?.zip, invalidZip, mismatches)

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
        if (value.zip !== padZip(location.zip)) return
        if (value.zip === invalidZip) return
        const state = otherFieldsEdited.current ? value.state : location.state
        const city = otherFieldsEdited.current ? value.city : location.city
        const county =
            !countyEdited.current &&
            !(otherFieldsEdited.current && (mismatch.state || mismatch.city))
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
        mismatch.state,
        mismatch.city,
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
                const previous = pickAddress(value)
                setCleared(previous)
                setZipCleared(previous)
                onClearedCountyChange(value?.county ?? '')
                update({ ...CLEARED_ADDRESS, zip: zip || null })
                return
            }
        }
        setZipChanged(true)
        update({ zip: zip || null })
    }

    return (
        <div role="group" aria-labelledby={labelId} className={styles.editor}>
            <AddressInput
                field="addressLine1"
                label="Address Line 1"
                autoComplete="address-line1"
                maxLength={100}
                value={value}
                cleared={cleared}
                partial={partial}
                onValueChange={updateOther}
            />
            <AddressInput
                field="addressLine2"
                label="Address Line 2"
                autoComplete="address-line2"
                maxLength={100}
                value={value}
                cleared={cleared}
                partial={partial}
                onValueChange={updateOther}
            />
            <div className={styles.region}>
                <AddressInput
                    field="city"
                    label="City"
                    autoComplete="address-level2"
                    maxLength={50}
                    value={value}
                    cleared={cleared}
                    partial={partial}
                    onValueChange={updateOther}
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
                <ZipInput
                    value={value?.zip}
                    placeholder={cleared.zip}
                    error={zipError}
                    partial={partial}
                    onValueChange={changeZip}
                />
            </div>
            {showCountry && (
                <AddressInput
                    field="country"
                    label="Country"
                    autoComplete="country-name"
                    maxLength={60}
                    value={value}
                    cleared={cleared}
                    partial={false}
                    onValueChange={updateOther}
                />
            )}
        </div>
    )
}

export interface AddressRowProps
    extends ListRowBaseProps, ListRowFieldProps<ListRowAddress> {
    location?: ZipLocation | null
    invalidZip?: string | null
    showCounty?: boolean
    showCountry?: boolean
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
    showCountry = false,
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
                skeletonLines={3}
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
                        showCountry={showCountry}
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
