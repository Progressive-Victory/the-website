'use client'

import styles from './JurisdictionField.module.css'
import { DropdownOverlay, DropdownOverlayButton } from '@/components/common'
import { useListEditing } from '@/components/common/list/ListContext'
import { DropdownRow } from '@/components/common/list/rows/DropdownRow'
import {
    useListField,
    type ListRowFieldProps,
} from '@/components/common/list/useListField'
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

export interface JurisdictionFieldProps extends ListRowFieldProps<
    string | null
> {
    label: string
    editing?: boolean
    readOnly?: boolean
}

export function JurisdictionField({
    value: valueProp,
    onValueChange: onValueChangeProp,
    field,
    getter,
    setter,
    validator,
    editing: editingOverride,
    ...rowProps
}: JurisdictionFieldProps) {
    const { value, onValueChange } = useListField<string | null>(
        {
            value: valueProp,
            onValueChange: onValueChangeProp,
            field,
            getter,
            setter,
            validator: validator ?? (() => true),
        },
        {
            required: false,
            isEmpty: (value) => !value?.trim(),
            editing: editingOverride,
        }
    )
    const jurisdiction = value ?? ''
    const editing = useListEditing(editingOverride)
    const initialSelection = getJurisdictionSelection(jurisdiction)
    const [selectedType, setSelectedType] = useState<JurisdictionType | null>(
        initialSelection.type
    )
    const [districtValue, setDistrictValue] = useState(
        initialSelection.districtValue
    )
    const otherInputRef = useRef<HTMLInputElement>(null)
    const previousEditing = useRef(editing)

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
    useEffect(() => {
        if (previousEditing.current === editing) return
        previousEditing.current = editing
        syncToJurisdiction()
    }, [editing, syncToJurisdiction])

    const confirm = (closeDropdown: () => void) => {
        if (!draftJurisdiction || !hasChange) return

        onValueChange(draftJurisdiction)
        closeDropdown()
    }

    return (
        <DropdownRow
            {...rowProps}
            editing={editingOverride}
            readOnly={rowProps.readOnly}
            value={jurisdiction}
            onValueChange={(next) => onValueChange(String(next))}
            placeholder="Select jurisdiction"
            triggerLabel={jurisdiction || 'Select jurisdiction'}
            onTriggerClick={syncToJurisdiction}
            validator={(next) =>
                validator ? validator(String(next ?? '')) : true
            }
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
                            onSelectGeneral={(type) => {
                                onValueChange(type)
                                closeDropdown()
                            }}
                        />
                    }
                />
            )}
        />
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
    onSelectGeneral: (type: GeneralJurisdictionType) => void
}

function JurisdictionOptions({
    jurisdiction,
    selectedType,
    setSelectedType,
    districtValue,
    setDistrictValue,
    otherInputRef,
    onConfirm,
    onSelectGeneral,
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
                    selected={selectedType === type}
                    onClick={() => {
                        if (selectedType === type) return
                        setSelectedType(type)
                        setDistrictValue('')
                        onSelectGeneral(type)
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
