import styles from './volunteer.module.css'
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
            <div className={styles.labelRow}>
                <div tabIndex={0} className={styles.tooltipWrapper}>
                    <InformationCircleIcon className={styles.infoIcon} />
                    <div className={styles.tooltip}>
                        <span className={styles.tooltipText}>{tooltip}</span>
                    </div>
                </div>

                <label htmlFor={name} className={styles.label}>
                    {placeholder}
                </label>
            </div>

            <div className={styles.switchWrapper}>
                <label
                    htmlFor={name}
                    className={`${styles.switch} ${
                        value ? styles.switchOn : styles.switchOff
                    }`}
                >
                    <input
                        type="checkbox"
                        id={name}
                        name={name}
                        required={required}
                        checked={value}
                        onChange={onChange}
                        className={styles.hiddenInput}
                    />
                    <span
                        className={`${styles.knob} ${
                            value ? styles.knobOn : styles.knobOff
                        }`}
                    />
                </label>
            </div>
        </div>
    )
}
