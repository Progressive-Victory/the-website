import { FormField, IBaseFormField } from '.'
import classNames from 'classnames'
import { ChangeEvent } from 'react'

export function CheckboxField({
    name,
    field,
    required = false,
    readonly = false,
    deprecated = false,
    dynamic,
}: IBaseFormField) {
    const value = (dynamic?.value as boolean) ?? false

    const isValid = (checked: boolean) => !required || checked

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const checked = event.target.checked
        dynamic?.onUpdate?.(field, checked, checked, isValid(checked))
    }

    return (
        <FormField
            name={name}
            field={field}
            required={required}
            deprecated={deprecated}
        >
            {readonly || dynamic?.disabled ? (
                <div className="col-span-2 w-full">{`${value}`}</div>
            ) : (
                <div className="col-span-2 flex items-center">
                    <input
                        type="checkbox"
                        name={name}
                        id={field}
                        disabled={dynamic?.loading}
                        required={required}
                        checked={value}
                        onChange={handleChange}
                        className={classNames(
                            !isValid(value) && 'border-red-300'
                        )}
                    />
                </div>
            )}
        </FormField>
    )
}
