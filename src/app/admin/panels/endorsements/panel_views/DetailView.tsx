'use client'

import styles from './DetailView.module.css'
import {
    CheckboxField,
    DateField,
    DropDownField,
    Form,
    FormField,
    FormFieldProps,
    FormGroup,
    FormState,
    TextField,
    useConfigure,
} from '@/components/common/forms'
import formFieldStyles from '@/components/common/forms/FormField.module.css'
import {
    BackgroundColor,
    ElectionStatus,
    Endorsement,
    EndorsementType,
    InitiativeType,
} from '@/contracts/data'
import {
    electionStatusOptions,
    endorsementLevelOptions,
    initiativeLevelOptions,
    stateOptions,
} from '@/models'
import { cn, parseErrorMessage } from '@/util'
import { ChangeEvent, useCallback, useState } from 'react'

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
    onCancel: () => void
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
    onCancel,
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
            onDelete={onDelete}
            onCancel={onCancel}
        >
            <FormGroup title="Details">
                <TextField label="Name" field="name" required />
                <DropDownField<Endorsement>
                    label="State"
                    field="state"
                    required
                    options={stateOptionsWithEmpty}
                />
                <CheckboxField label="Incumbent" field="incumbent" />
                <CheckboxField label="PV Member" field="isPvMember" />
                <DropDownField<Endorsement>
                    label="Avatar Background"
                    getter={(form) => form.avatarBgColor}
                    setter={(form, field) => ({
                        ...form,
                        avatarBgColor: Number(field) as BackgroundColor,
                    })}
                    options={avatarBgColorOptions}
                />
                <ImageField
                    label="Image"
                    field="imgHref"
                    uploadImage={uploadImage}
                />
            </FormGroup>
            <FormGroup title="Election Information">
                <DropDownField<Endorsement>
                    label="Election Status"
                    getter={(form) => form.electionStatus}
                    setter={(form, field) => ({
                        ...form,
                        electionStatus: Number(field) as ElectionStatus,
                    })}
                    options={electionStatusOptions}
                />
                <TextField label="Jurisdiction" field="jurisdiction" />
                <DateField
                    label="General Election"
                    field="generalElectionDate"
                    format={{ dateStyle: 'medium' }}
                />
                <DateField
                    label="Primary Election"
                    field="primaryElectionDate"
                    format={{ dateStyle: 'medium' }}
                />
            </FormGroup>
            <FormGroup title="Socials">
                <HandleField label="Handle" />
                <LinkField label="Social Link" field="handleHref" />
                <LinkField label="Website Link" field="websiteHref" />
                <LinkField label="Donate Link" field="donateHref" />
            </FormGroup>
            <FormGroup title="Endorsement Details">
                <DropDownField<Endorsement>
                    label="Endorsement Tier"
                    getter={(form) => form.endorsementLevel}
                    setter={(form, field) => ({
                        ...form,
                        endorsementLevel: Number(field) as EndorsementType,
                    })}
                    options={endorsementLevelOptions}
                />
                <TextField label="Reason" field="endorsementReason" />
                <DropDownField<Endorsement>
                    label="Organizing Initiative"
                    getter={(form) => form.initiativeLevel}
                    setter={(form, field) => ({
                        ...form,
                        initiativeLevel: Number(field) as InitiativeType,
                    })}
                    options={initiativeLevelOptions}
                />
                <QuoteField label="Announcement Message" />
                <CheckboxField
                    label="Publish Endorsement"
                    field="endorsementPublished"
                />
            </FormGroup>
        </Form>
    )
}

function HandleField(
    props: FormFieldProps<Endorsement, string | null | undefined>
) {
    return (
        <TextField<Endorsement>
            {...props}
            readonly={!props.dynamic?.editing}
            getter={(form) => {
                if (!form.handle) return ''
                if (props.dynamic?.editing) return form.handle
                return `@${form.handle.replace(/^@+/, '')}`
            }}
            setter={(form, field) => ({
                ...form,
                handle: String(field ?? '').replace(/^@+/, '') || null,
            })}
        />
    )
}

function QuoteField(
    props: FormFieldProps<Endorsement, string | null | undefined>
) {
    return (
        <TextField<Endorsement>
            {...props}
            getter={(form) => {
                if (props.dynamic?.editing || !form.handle) return form.quote

                const handle = `@${form.handle.replace(/^@+/, '')}`
                return form.quote ? `${handle} ${form.quote}` : handle
            }}
            setter={(form, field) => ({
                ...form,
                quote: field ?? null,
            })}
        />
    )
}

function LinkField(
    props: FormFieldProps<Endorsement, string | null | undefined>
) {
    const { getter, validator, onChange, readonly } = useConfigure(
        props,
        useCallback(
            (field: string | null | undefined) =>
                !props.required || !!field?.trim(),
            [props.required]
        )
    )
    const value = props.dynamic ? (getter(props.dynamic.form) ?? '') : ''

    return (
        <FormField {...props}>
            {readonly ? (
                <>
                    {value && (
                        <a
                            className={styles.linkValue}
                            href={value}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {value}
                        </a>
                    )}
                </>
            ) : (
                <input
                    type="text"
                    id={props.id}
                    name={props.label}
                    disabled={props.disabled ?? props.dynamic?.saving}
                    required={props.required}
                    value={value}
                    onInput={(event) =>
                        onChange((event.target as HTMLInputElement).value)
                    }
                    className={cn(
                        formFieldStyles.textField,
                        !validator(value) && formFieldStyles.invalid
                    )}
                />
            )}
        </FormField>
    )
}

interface ImageFieldProps extends FormFieldProps<
    Endorsement,
    string | null | undefined
> {
    uploadImage: (image: File) => Promise<{ url: string }>
}

function ImageField(props: ImageFieldProps) {
    const { onChange, readonly } = useConfigure(
        props,
        useCallback(
            (field: string | null | undefined) =>
                !props.required || !!field?.trim(),
            [props.required]
        )
    )
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        event.target.value = ''
        if (!file) return

        setUploading(true)
        setError(null)

        try {
            const { url } = await props.uploadImage(file)
            onChange(url)
        } catch (uploadError) {
            setError(parseErrorMessage(uploadError, 'Failed to upload image'))
        } finally {
            setUploading(false)
        }
    }

    if (!props.dynamic?.editing) return null

    const hasImage = !!props.dynamic.form.imgHref

    return (
        <FormField {...props}>
            <div className={styles.imageField}>
                {!readonly && (
                    <label className={styles.uploadButton}>
                        {uploading
                            ? 'Uploading...'
                            : hasImage
                              ? 'Modify Image'
                              : 'Upload Image'}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(event) => void handleFileChange(event)}
                            disabled={uploading}
                            hidden
                        />
                    </label>
                )}
                {error && <span className={styles.uploadError}>{error}</span>}
            </div>
        </FormField>
    )
}
