'use client'

import styles from './JurisdictionField.module.css'
import {
    DropdownButton,
    DropdownOverlay,
    DropdownOverlayButton,
} from '@/components/common'
import {
    FormField,
    FormFieldProps,
    useConfigure,
} from '@/components/common/forms'
import formFieldStyles from '@/components/common/forms/FormField.module.css'
import { Endorsement } from 'pv-contracts/data'
import {
    Dispatch,
    KeyboardEvent,
    RefObject,
    SetStateAction,
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react'
import z from 'zod'

const generalJurisdiction = z.enum(['Nationwide', 'Statewide'])
const otherJurisdictionType = 'Other' as const

const districtJurisdiction = z.enum([
    'Congressional District',
    'Legislative District',
    'Senate District',
])

type GeneralJurisdictionType = z.infer<typeof generalJurisdiction>
type DistrictJurisdictionType = z.infer<typeof districtJurisdiction>
type JurisdictionType =
    | GeneralJurisdictionType
    | DistrictJurisdictionType
    | typeof otherJurisdictionType

const isDistrictJurisdiction = (
    type: JurisdictionType | null
): type is DistrictJurisdictionType =>
    districtJurisdiction.safeParse(type).success

const getJurisdictionSelection = (jurisdiction: string) => {
    const generalType = generalJurisdiction.options.find(
        (option) => jurisdiction === option
    )
    const districtType = districtJurisdiction.options.find((option) =>
        jurisdiction.startsWith(`${option} `)
    )
    const type =
        generalType ??
        districtType ??
        (jurisdiction ? otherJurisdictionType : null)

    return {
        type,
        districtValue: districtType
            ? jurisdiction.slice(districtType.length + 1)
            : type === otherJurisdictionType
              ? jurisdiction
              : '',
    }
}

export function JurisdictionField(
    props: FormFieldProps<Endorsement, string | null | undefined>
) {
    const { getter, onChange, readonly, disabled } = useConfigure(
        props,
        useCallback(() => true, [])
    )
    const jurisdiction = props.dynamic ? (getter(props.dynamic.form) ?? '') : ''
    const initialSelection = getJurisdictionSelection(jurisdiction)
    const [selectedType, setSelectedType] = useState<JurisdictionType | null>(
        initialSelection.type
    )
    const [districtValue, setDistrictValue] = useState(
        initialSelection.districtValue
    )
    const otherInputRef = useRef<HTMLInputElement>(null)

    const normalizedDistrictValue = districtValue.trim()
    const draftJurisdiction = !selectedType
        ? null
        : isDistrictJurisdiction(selectedType)
          ? normalizedDistrictValue
              ? `${selectedType} ${normalizedDistrictValue}`
              : null
          : selectedType === otherJurisdictionType
            ? normalizedDistrictValue || null
            : selectedType
    const hasChange =
        draftJurisdiction !== null && draftJurisdiction !== jurisdiction

    const syncToJurisdiction = useCallback(() => {
        const selection = getJurisdictionSelection(jurisdiction)
        setSelectedType(selection.type)
        setDistrictValue(selection.districtValue)
    }, [jurisdiction])

    useEffect(syncToJurisdiction, [syncToJurisdiction])

    const confirm = (closeDropdown: () => void) => {
        if (!draftJurisdiction || !hasChange) return

        onChange(draftJurisdiction)
        closeDropdown()
    }

    if (readonly)
        return (
            <FormField {...props}>
                <div className={formFieldStyles.readonly}>{jurisdiction}</div>
            </FormField>
        )

    return (
        <FormField {...props}>
            <DropdownButton
                label={jurisdiction || 'Select jurisdiction'}
                disabled={disabled}
                className={styles.trigger}
                onClick={syncToJurisdiction}
                menu={({ closeDropdown }) => (
                    <DropdownOverlay
                        label="Select jurisdiction"
                        onClose={closeDropdown}
                        onClick={(event) => {
                            event.preventDefault()
                            event.stopPropagation()
                        }}
                        narrowLayoutMode="trigger"
                        className={styles.overlay}
                        footerButtonLabel="Confirm"
                        footerButtonClassName={styles.confirmButton}
                        footerButtonDisabled={!hasChange}
                        footerButtonOnClick={() => confirm(closeDropdown)}
                        body={
                            <JurisdictionOptions
                                jurisdiction={jurisdiction}
                                selectedType={selectedType}
                                setSelectedType={setSelectedType}
                                districtValue={districtValue}
                                setDistrictValue={setDistrictValue}
                                otherInputRef={otherInputRef}
                                onConfirm={() => confirm(closeDropdown)}
                            />
                        }
                    />
                )}
            />
        </FormField>
    )
}

interface JurisdictionOptionsProps {
    jurisdiction: string
    selectedType: JurisdictionType | null
    setSelectedType: Dispatch<SetStateAction<JurisdictionType | null>>
    districtValue: string
    setDistrictValue: Dispatch<SetStateAction<string>>
    otherInputRef: RefObject<HTMLInputElement | null>
    onConfirm: () => void
}

function JurisdictionOptions({
    jurisdiction,
    selectedType,
    setSelectedType,
    districtValue,
    setDistrictValue,
    otherInputRef,
    onConfirm,
}: JurisdictionOptionsProps) {
    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key !== 'Enter') return

        event.preventDefault()
        onConfirm()
    }

    const selectDistrict = (type: DistrictJurisdictionType) => {
        setSelectedType(type)
        setDistrictValue(
            jurisdiction.startsWith(`${type} `)
                ? jurisdiction.slice(type.length + 1)
                : ''
        )
    }

    const selectOther = () => {
        setSelectedType(otherJurisdictionType)
        setDistrictValue(
            getJurisdictionSelection(jurisdiction).type ===
                otherJurisdictionType
                ? jurisdiction
                : ''
        )
        requestAnimationFrame(() => otherInputRef.current?.focus())
    }

    return (
        <div className={styles.options}>
            {generalJurisdiction.options.map((type) => (
                <DropdownOverlayButton
                    key={type}
                    checked={selectedType === type}
                    onCheckedChange={(checked) => {
                        setSelectedType(checked ? type : null)
                        setDistrictValue('')
                    }}
                >
                    {type}
                </DropdownOverlayButton>
            ))}
            {districtJurisdiction.options.map((type) => (
                <DistrictOption
                    key={type}
                    type={type}
                    selected={selectedType === type}
                    value={districtValue}
                    onSelect={() => selectDistrict(type)}
                    onValueChange={setDistrictValue}
                    onKeyDown={handleKeyDown}
                />
            ))}
            {selectedType === otherJurisdictionType ? (
                <input
                    ref={otherInputRef}
                    type="text"
                    aria-label="Other jurisdiction"
                    placeholder="Custom Jurisdiction"
                    value={districtValue}
                    onChange={(event) =>
                        setDistrictValue(event.target.value.slice(0, 100))
                    }
                    onKeyDown={handleKeyDown}
                    className={styles.otherInput}
                />
            ) : (
                <DropdownOverlayButton onClick={selectOther}>
                    Other
                </DropdownOverlayButton>
            )}
        </div>
    )
}

interface DistrictOptionProps {
    type: DistrictJurisdictionType
    selected: boolean
    value: string
    onSelect: () => void
    onValueChange: (value: string) => void
    onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void
}

function DistrictOption({
    type,
    selected,
    value,
    onSelect,
    onValueChange,
    onKeyDown,
}: DistrictOptionProps) {
    return (
        <div className={styles.option}>
            <DropdownOverlayButton
                className={styles.optionButton}
                selected={selected}
                onClick={() => !selected && onSelect()}
            >
                {type}
            </DropdownOverlayButton>
            {selected && (
                <input
                    autoFocus
                    type="text"
                    aria-label={`${type} value`}
                    value={value}
                    onChange={(event) =>
                        onValueChange(
                            event.target.value
                                .replace(/[^a-zA-Z0-9 ]/g, '')
                                .slice(0, 20)
                        )
                    }
                    onKeyDown={onKeyDown}
                    className={styles.districtInput}
                />
            )}
        </div>
    )
}
