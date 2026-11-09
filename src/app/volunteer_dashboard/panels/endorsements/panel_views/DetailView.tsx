'use client'

import { JurisdictionField } from '../components/JurisdictionField'
import styles from './DetailView.module.css'
import { Form, FormControls, FormState } from '@/components/common/forms'
import {
    ButtonToggleRow,
    DateRow,
    DropdownRow,
    List,
    ListBreak,
    LongTextRow,
    ListRow,
    PickerRow,
    TextRow,
    ToggleRow,
    UploadRow,
    type ListRowBaseProps,
} from '@/components/common/list'
import { useListEditing } from '@/components/common/list/ListContext'
import longTextStyles from '@/components/common/list/rows/LongTextRow.module.css'
import fields from '@/components/common/list/rows/fields.module.css'
import {
    useListField,
    type ListRowFieldProps,
} from '@/components/common/list/useListField'
import {
    electionStatusOptions,
    endorsementLevelOptions,
    initiativeLevelOptions,
    stateOptions,
} from '@/models'
import { cn } from '@/util'
import { BackgroundColor, Endorsement } from 'pv-contracts/data'
import { useLayoutEffect, useRef } from 'react'

const stateOptionsWithEmpty = [
    { value: '', label: 'No state selected' },
    ...stateOptions,
]

const avatarBgColorOptions = [
    { value: BackgroundColor.Blue, label: 'Blue' },
    { value: BackgroundColor.Yellow, label: 'Yellow' },
]

interface DetailViewProps {
    endorsement: Endorsement | null
    title: string
    saving: boolean
    onUpdate: (next: FormState<Endorsement> | null) => void
    onSave: (endorsement: Endorsement) => void | boolean
    onCreate: () => Endorsement
    onDelete: () => void
    editDisabledReason?: string
    deleteDisabledReason?: string
    onCancel: () => void
    showCreateButton?: boolean
    controlsRef?: React.Ref<FormControls>
    uploadImage: (image: File) => Promise<{ url: string }>
    beforeHeader?: React.ReactElement
    className?: string
}

export function DetailView({
    endorsement,
    title,
    saving,
    onUpdate,
    onSave,
    onCreate,
    onDelete,
    editDisabledReason,
    deleteDisabledReason,
    onCancel,
    showCreateButton,
    controlsRef,
    uploadImage,
    beforeHeader,
    className,
}: DetailViewProps) {
    return (
        <Form<Endorsement>
            className={className}
            form={endorsement}
            title={title}
            saving={saving}
            beforeHeader={beforeHeader}
            onUpdate={onUpdate}
            onSave={onSave}
            onCreate={onCreate}
            showCreateButton={showCreateButton}
            controlsRef={controlsRef}
            onDelete={onDelete}
            editDisabledReason={editDisabledReason}
            deleteDisabledReason={deleteDisabledReason}
            onCancel={onCancel}
        >
            <List title="Details">
                <TextRow
                    label="Name"
                    field="name"
                    indicator="required"
                    placeholder="Enter Name"
                />
                <PickerRow
                    label="State"
                    field="state"
                    indicator="required"
                    options={stateOptionsWithEmpty}
                />
                <ToggleRow label="Incumbent" field="incumbent" />
                <ToggleRow label="PV Member" field="isPvMember" />
                <ListBreak editingOnly />
                <DropdownRow
                    label="Background Color"
                    getter={(form: Endorsement) => form.avatarBgColor}
                    setter={(form: Endorsement, field) => ({
                        ...form,
                        avatarBgColor: Number(field),
                    })}
                    options={avatarBgColorOptions}
                />
                <UploadRow
                    label="Image"
                    field="imgHref"
                    uploadFile={uploadImage}
                    hidden
                />
            </List>
            <List title="Election Information">
                <DropdownRow
                    label="Election Status"
                    field="electionStatus"
                    options={electionStatusOptions}
                />
                <JurisdictionField label="Jurisdiction" field="jurisdiction" />
                <ListBreak />
                <DateRow
                    label="General Election"
                    field="generalElectionDate"
                    dateFormat={{ dateStyle: 'medium' }}
                />
                <DateRow
                    label="Primary Election"
                    field="primaryElectionDate"
                    dateFormat={{ dateStyle: 'medium' }}
                />
            </List>
            <List title="Socials">
                <HandleRow label="Handle" field="handle" />
                <SocialLinkRow label="Social Link" field="handleHref" />
                <SocialLinkRow label="Website Link" field="websiteHref" />
                <SocialLinkRow label="Donate Link" field="donateHref" />
            </List>
            <List title="Endorsement Details">
                <DropdownRow
                    label="Endorsement Tier"
                    getter={(form: Endorsement) => form.endorsementLevel}
                    setter={(form: Endorsement, field) => ({
                        ...form,
                        endorsementLevel: Number(field),
                    })}
                    options={endorsementLevelOptions}
                />
                <LongTextRow
                    label="Reason"
                    field="endorsementReason"
                    placeholder="Enter Reason"
                />
                <DropdownRow
                    label="Organizing Initiative"
                    getter={(form: Endorsement) => form.initiativeLevel}
                    setter={(form: Endorsement, field) => ({
                        ...form,
                        initiativeLevel: Number(field),
                    })}
                    options={initiativeLevelOptions}
                />
                <QuoteRow label="Announcement Message" />
                <ListBreak />
                <ButtonToggleRow
                    label="Publish Endorsement"
                    field="endorsementPublished"
                    enableLabel="Publish"
                    disableLabel="Unpublish"
                    enabledValueLabel="Published"
                    disabledValueLabel="Not Published"
                />
            </List>
        </Form>
    )
}

type SocialRowProps = ListRowBaseProps &
    ListRowFieldProps<string | null | undefined>

function HandleRow({
    label,
    field,
    getter,
    setter,
    validator,
    ...rowProps
}: SocialRowProps) {
    const { value, onValueChange, invalid } = useListField<string | null>(
        {
            field,
            getter,
            setter,
            validator,
        },
        {
            required: rowProps.indicator === 'required',
            isEmpty: (value) => !value?.trim(),
            editing: rowProps.editing,
        }
    )

    return (
        <ListRow
            {...rowProps}
            label={label}
            invalid={invalid}
            value={value ? `@${value.replace(/^@+/, '')}` : undefined}
            editor={(labelId) => (
                <input
                    type="text"
                    aria-labelledby={labelId}
                    value={value ?? ''}
                    placeholder="Social Handle"
                    onChange={(event) =>
                        onValueChange(
                            event.target.value.replace(/^@+/, '') || null
                        )
                    }
                    className={fields.textField}
                />
            )}
        />
    )
}

interface QuoteRowValue {
    handle: string | null
    quote: string | null
}

function QuoteRow({ label }: ListRowBaseProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const editing = useListEditing()
    const { value, onValueChange, invalid } = useListField<QuoteRowValue>(
        {
            getter: (form: Endorsement) => ({
                handle: form.handle,
                quote: form.quote,
            }),
            setter: (form: Endorsement, next) => ({
                ...form,
                quote: next.quote,
            }),
        },
        {
            required: false,
            isEmpty: (value) => !value?.quote?.trim(),
        }
    )
    const handle = value?.handle?.replace(/^@+/, '')
    const displayValue = [handle && `@${handle}`, value?.quote?.trim()]
        .filter(Boolean)
        .join(' ')

    useLayoutEffect(() => {
        const textarea = textareaRef.current
        if (!textarea || !editing) return

        textarea.style.height = 'auto'
        const computedStyle = window.getComputedStyle(textarea)
        const borderHeight =
            Number.parseFloat(computedStyle.borderTopWidth) +
            Number.parseFloat(computedStyle.borderBottomWidth)
        textarea.style.height = `${textarea.scrollHeight + borderHeight}px`
    }, [editing, value?.quote])

    return (
        <ListRow
            label={label}
            labelAlign="top"
            className={longTextStyles.row}
            invalid={invalid}
            value={displayValue || undefined}
            editor={(labelId) => (
                <div className={longTextStyles.editor}>
                    <textarea
                        ref={textareaRef}
                        aria-labelledby={labelId}
                        value={value?.quote ?? ''}
                        placeholder="Enter Public Statement"
                        rows={3}
                        onChange={(event) =>
                            onValueChange({
                                handle: value?.handle ?? null,
                                quote: event.target.value || null,
                            })
                        }
                        className={cn(
                            fields.textField,
                            longTextStyles.textarea
                        )}
                    />
                </div>
            )}
        />
    )
}

function SocialLinkRow({
    label,
    field,
    getter,
    setter,
    validator,
    ...rowProps
}: SocialRowProps) {
    const { value, onValueChange, invalid } = useListField<string | null>(
        {
            field,
            getter,
            setter,
            validator,
        },
        {
            required: rowProps.indicator === 'required',
            isEmpty: (value) => !value?.trim(),
            editing: rowProps.editing,
        }
    )

    return (
        <ListRow
            {...rowProps}
            label={label}
            invalid={invalid}
            value={
                value && (
                    <a
                        className={styles.linkValue}
                        href={value}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {value}
                    </a>
                )
            }
            editor={(labelId) => (
                <input
                    type="text"
                    aria-labelledby={labelId}
                    value={value ?? ''}
                    placeholder="Paste Link"
                    onChange={(event) => onValueChange(event.target.value)}
                    className={fields.textField}
                />
            )}
        />
    )
}
