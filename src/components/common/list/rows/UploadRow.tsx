'use client'

import { useListEditing } from '../ListContext'
import { ListRow, type ListRowBaseProps } from '../ListRow'
import { useListField, type ListRowFieldProps } from '../useListField'
import styles from './UploadRow.module.css'
import { useRef, useState, type ChangeEvent } from 'react'

export interface UploadRowProps
    extends ListRowBaseProps, ListRowFieldProps<string | null> {
    uploadFile: (file: File) => Promise<{ url: string }>
    accept?: string
    uploadLabel?: string
    replaceLabel?: string
    hidden?: boolean
}

export function UploadRow({
    value: valueProp,
    onValueChange: onValueChangeProp,
    field,
    getter,
    setter,
    validator,
    uploadFile,
    accept = 'image/*',
    uploadLabel = 'Upload Image',
    replaceLabel = 'Replace Image',
    hidden = false,
    ...rowProps
}: UploadRowProps) {
    const editing = useListEditing(rowProps.editing)
    const inputRef = useRef<HTMLInputElement>(null)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { value, onValueChange, invalid } = useListField<string | null>(
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
            isEmpty: (value) => !value?.trim(),
            editing: rowProps.editing,
        }
    )
    if (hidden && !editing) return null

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.currentTarget.files?.[0]
        event.currentTarget.value = ''
        if (!file) return

        setUploading(true)
        setError(null)
        try {
            const result = await uploadFile(file)
            onValueChange(result.url)
        } catch (uploadError) {
            setError(
                uploadError instanceof Error
                    ? uploadError.message
                    : 'Upload failed'
            )
        } finally {
            setUploading(false)
        }
    }

    return (
        <ListRow
            {...rowProps}
            invalid={invalid}
            value={value}
            editor={(labelId) => (
                <div className={styles.editor}>
                    <input
                        ref={inputRef}
                        type="file"
                        accept={accept}
                        aria-label="Choose file"
                        onChange={(event) => void handleFileChange(event)}
                        hidden
                    />
                    <button
                        type="button"
                        aria-labelledby={labelId}
                        className={styles.button}
                        disabled={uploading}
                        onClick={() => inputRef.current?.click()}
                    >
                        {uploading
                            ? 'Uploading...'
                            : value
                              ? replaceLabel
                              : uploadLabel}
                    </button>
                    {error && (
                        <span className={styles.error} role="alert">
                            {error}
                        </span>
                    )}
                </div>
            )}
        />
    )
}
