import { FormField, FormFieldProps, useConfigure } from './FormField'
import styles from './FormField.module.css'
import { MultiSelect, MultiSelectOption } from '@/components/common'
import { setOptions } from 'leaflet';
import React, { useCallback, KeyboardEventHandler } from 'react'
import CreatableSelect from 'react-select/creatable';

export interface CreatableMultiProps<T> extends FormFieldProps<
    T,
    (string | number)[] | null | undefined
> {
    options: MultiSelectOption[]
}

const createOption = (label: string) => ({
  label,
  value: label,
});

export function CreatableMulti<T>(props: CreatableMultiProps<T>) {
    const [inputValue, setInputValue] = React.useState('');
    const [options, setOption] = React.useState<readonly MultiSelectOption[]>([]);
    const { getter, onChange, readonly, disabled } = useConfigure(
        props,
        useCallback(
            (field: (string | number)[] | null | undefined) =>
                !props.required || !!field?.length,
            [props.required]
        )
    )

    const value = getter(props.dynamic!.form) ?? []


    const handleKeyDown: KeyboardEventHandler = (event) => {
        if (!inputValue) return;
        switch (event.key) {
        case 'Enter':
        case 'Tab':
            setOption((prev) => [...prev, createOption(inputValue)]);
            setInputValue('');
            event.preventDefault();
        }
    };

    const handleUpdate = (selected: (string | number)[]) => {
        onChange(selected)
    }

    return (
        <FormField {...props}>
            <CreatableSelect
                inputValue={inputValue}
                isClearable
                isMulti
                menuIsOpen={false}
                onChange={(newValue) => setOption(newValue)}
                onInputChange={(newValue) => setInputValue(newValue)}
                onKeyDown={handleKeyDown}
                placeholder="Type something and press enter..."
                value={options}
            />
        </FormField>
        
    )
}
