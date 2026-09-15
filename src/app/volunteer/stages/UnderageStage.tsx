import styles from './stages.module.css'
import { cn } from '@/util'
import { useInit } from '@/util/hooks'
import { FaCalendar } from 'react-icons/fa6'

export interface UnderageStageProps {
    isPending: boolean
    onAgeUp: () => void
}

export function UnderageStage({ isPending, onAgeUp }: UnderageStageProps) {
    useInit(() => onAgeUp())

    return (
        <div className={styles.container}>
            <FaCalendar className={cn(styles.icon, styles.success)} />
            <p className={styles.subtitle}>
                Sorry! You have to be 18 years old or older to volunteer with
                Progressive Victory.
            </p>
            <button
                disabled={isPending}
                onClick={onAgeUp}
                className={styles.button}
            >
                Check again
            </button>
        </div>
    )
}
