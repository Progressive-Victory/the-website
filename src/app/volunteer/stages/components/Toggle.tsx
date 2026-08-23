import styles from './components.module.css'
import { cn } from '@/util'
import { InformationCircleIcon } from '@heroicons/react/24/solid'
import { ReactElement } from 'react'

export function Toggle({
    name,
    value,
    onChange,
    placeholder,
    tooltip,
    required = false,
}: {
    name: string
    value: boolean
    onChange: () => void
    placeholder?: string | ReactElement
    tooltip?: string
    required?: boolean
}) {
    return (
        <div className={styles.toggleContainer}>
            <div className={styles.toggleLabelContainer}>
                <div tabIndex={0} className={styles.tooltipContainer}>
                    <InformationCircleIcon className={styles.tooltipIcon} />
                    <div className={styles.tooltipElement}>
                        <span className={styles.tooltipContent}>{tooltip}</span>
                    </div>
                </div>

                <label htmlFor={name} className={styles.toggleLabel}>
                    {placeholder}
                </label>
            </div>

            <div className={styles.toggleInputContainer}>
                <label
                    className={cn(
                        styles.toggleInputLabel,
                        value && styles.selected
                    )}
                    htmlFor={name}
                >
                    <input
                        type="checkbox"
                        name={name}
                        id={name}
                        required={required}
                        checked={value}
                        onChange={onChange}
                        className={styles.toggleInput}
                    />
                    <span
                        className={cn(
                            styles.toggleInputThumb,
                            value && styles.selected
                        )}
                    />
                </label>
            </div>
        </div>
    )
}
