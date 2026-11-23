'use client'

import { ListRow, type ListRowBaseProps } from '../ListRow'
import { useListField, type ListRowFieldProps } from '../useListField'
import styles from './NameRow.module.css'
import fields from './fields.module.css'

export interface ListRowName {
    firstName?: string | null
    lastName?: string | null
}

const MAX_LENGTH = 50

export function formatName(name?: ListRowName | null) {
    return [name?.firstName?.trim(), name?.lastName?.trim()]
        .filter(Boolean)
        .join(' ')
}

export interface NameRowProps
    extends ListRowBaseProps, ListRowFieldProps<ListRowName> {
    firstNameField?: string
    lastNameField?: string
    maxLength?: number
}

export function NameRow({
    value: valueProp,
    onValueChange: onValueChangeProp,
    field,
    getter,
    setter,
    validator,
    firstNameField = 'firstName',
    lastNameField = 'lastName',
    maxLength = MAX_LENGTH,
    ...rowProps
}: NameRowProps) {
    const bindsNameFields =
        valueProp === undefined && field == null && getter == null

    const defaultGetter = (form: Record<string, unknown>): ListRowName => ({
        firstName: (form?.[firstNameField] as string | null) ?? null,
        lastName: (form?.[lastNameField] as string | null) ?? null,
    })
    const defaultSetter = (
        form: Record<string, unknown>,
        name: ListRowName
    ) => ({
        ...form,
        [firstNameField]: name.firstName ?? null,
        [lastNameField]: name.lastName ?? null,
    })

    const { value, onValueChange, invalid } = useListField<ListRowName>(
        {
            value: valueProp,
            onValueChange: onValueChangeProp,
            field,
            getter: bindsNameFields ? defaultGetter : getter,
            setter: bindsNameFields ? defaultSetter : setter,
            validator,
        },
        {
            required: rowProps.indicator === 'required',
            isEmpty: (value) =>
                !value?.firstName?.trim() || !value.lastName?.trim(),
            editing: rowProps.editing,
        }
    )

    const update = (patch: ListRowName) => onValueChange({ ...value, ...patch })

    return (
        <ListRow
            {...rowProps}
            invalid={invalid}
            value={formatName(value)}
            editor={(labelId) => (
                <div
                    role="group"
                    aria-labelledby={labelId}
                    className={styles.editor}
                >
                    <input
                        type="text"
                        aria-label="First Name"
                        placeholder="First Name"
                        autoComplete="given-name"
                        maxLength={maxLength}
                        value={value?.firstName ?? ''}
                        onChange={(event) =>
                            update({
                                firstName: event.target.value.slice(
                                    0,
                                    maxLength
                                ),
                            })
                        }
                        className={fields.textField}
                    />
                    <input
                        type="text"
                        aria-label="Last Name"
                        placeholder="Last Name"
                        autoComplete="family-name"
                        maxLength={maxLength}
                        value={value?.lastName ?? ''}
                        onChange={(event) =>
                            update({
                                lastName: event.target.value.slice(
                                    0,
                                    maxLength
                                ),
                            })
                        }
                        className={fields.textField}
                    />
                </div>
            )}
        />
    )
}
