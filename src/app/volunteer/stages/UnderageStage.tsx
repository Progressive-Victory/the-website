import styles from './stages.module.css'
import { cn } from '@/util'
import { useInit } from '@/util/hooks'
import { CalendarIcon } from '@heroicons/react/24/solid'

export interface UnderageStageProps {
    isPending: boolean
    onAgeUp: () => void
}

export function UnderageStage({ isPending, onAgeUp }: UnderageStageProps) {
    useInit(() => onAgeUp())

    return (
        <div className={styles.container}>
            <CalendarIcon className={cn(styles.icon, styles.success)} />
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
