import { FormField, FormFieldProps, getGetter, getSetter } from './FormField'
import styles from './FormField.module.css'
import { MultiSelect, MultiSelectOption } from '@/components/common'

export interface SelectManyFieldProps<T>
    extends FormFieldProps<T, (string | number)[] | null | undefined> {
    options: MultiSelectOption[]
}

export function SelectManyField<T>(props: SelectManyFieldProps<T>) {
    props.getter ??= getGetter(props)
    props.setter ??= getSetter(props)
    props.validator ??= (field: (string | number)[] | null | undefined) =>
        !props.required || !!field?.length

    const readonly = !!props.readonly || !props.dynamic?.editing
    const disabled = !!props.disabled || !!props.dynamic?.saving
    const value = props?.getter?.(props.dynamic!.form) ?? []

    const handleUpdate = (selected: (string | number)[]) => {
        props.dynamic?.onChange?.(props, selected)
    }

    return (
        <FormField {...props}>
            <div className={styles.selectManyField}>
                <MultiSelect
                    name={props.label}
                    options={props.options}
                    selected={value}
                    readonly={readonly}
                    disabled={disabled}
                    onUpdate={handleUpdate}
                />
            </div>
        </FormField>
    )
}
