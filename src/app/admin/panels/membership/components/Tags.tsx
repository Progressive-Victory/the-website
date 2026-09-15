'use client'

import styles from './Tags.module.css'
import { cn } from '@/util'
import { FiCheck, FiX } from 'react-icons/fi'

const Check = () => <FiCheck strokeWidth={3} />
const Cross = () => <FiX strokeWidth={3} />

export const BoolTag = ({ value }: { value?: boolean }) => (
    <span className={cn(styles.tag, value ? styles.tagGreen : styles.tagRed)}>
        {value ? <Check /> : <Cross />}
    </span>
)

export const EditableBoolTag = ({
    label,
    value,
    onToggle,
}: {
    label: string
    value?: boolean
    onToggle: () => void
}) => (
    <span
        className={cn(
            styles.tag,
            value ? styles.tagGreen : styles.tagRed,
            styles.editableBoolTag
        )}
        aria-pressed={value === true}
        aria-label={value ? `${label} confirmed` : `${label} not confirmed`}
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onToggle()
            }
        }}
    >
        {value ? <Check /> : <Cross />}
    </span>
)

export const ConfirmedBadge = ({
    label,
    confirmed,
}: {
    label: string
    confirmed?: boolean
}) => (
    <span
        className={styles.confirmBadge}
        data-tooltip={`${label} ${confirmed ? 'Confirmed' : 'Not Confirmed'}`}
        tabIndex={0}
    >
        {confirmed ? (
            <FiCheck className={styles.nameVerified} strokeWidth={3} />
        ) : (
            <FiX className={styles.nameUnverified} strokeWidth={3} />
        )}
    </span>
)
