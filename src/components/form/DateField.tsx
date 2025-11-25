import { FormField, IBaseFormField } from './FormField'
import { dateService } from '@/services'
import classNames from 'classnames'
import { FormEvent } from 'react'

export function DateField({
    name,
    field,
    required = false,
    readonly = false,
    deprecated = false,
    dynamic,
}: IBaseFormField) {
    const value = (dynamic?.value as string) ?? ''
    const iso = dateService.toISODateString(value)

    const format = () => {
        if (iso) {
            const [year, month, day] = iso.split('-')
            return `${month}/${day}/${year}`
        }
        return value
    }

    const handleInput = (event: FormEvent<HTMLInputElement>) => {
        const formatted = (event.target as HTMLTextAreaElement).value
        const normalized = dateService.toISODateString(formatted)
        dynamic?.onUpdate?.(field, normalized, normalized, normalized != null)
    }

    return (
        <FormField
            name={name}
            field={field}
            required={required}
            deprecated={deprecated}
        >
            {readonly || dynamic?.disabled ? (
                <div className="col-span-2 w-full">{format()}</div>
            ) : (
                <input
                    type="date"
                    name={name}
                    id={field}
                    disabled={dynamic?.loading}
                    required={required}
                    value={iso ?? ''}
                    onInput={handleInput}
                    className={classNames(
                        'col-span-2 w-full max-w-96 rounded-lg border border-gray-300 px-3 py-0.5',
                        !iso && 'border-red-300'
                    )}
                />
            )}
        </FormField>
    )
}
