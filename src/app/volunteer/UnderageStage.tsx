import styles from './volunteer.module.css'
import { dateService } from '@/services'
import { useInit } from '@/util/hooks'
import { CalendarIcon } from '@heroicons/react/24/solid'

export interface UnderageStageProps {
    dateOfBirth: string | undefined
    onAgeUp: () => void
}

export function UnderageStage({ dateOfBirth, onAgeUp }: UnderageStageProps) {
    useInit(() => {
        const age = dateService.getAge(dateOfBirth ?? '') ?? 0
        if (age >= 18) onAgeUp()
    })

    return (
        <div className={styles.underageContainer}>
            <CalendarIcon className={styles.icon} />
            <p className={styles.message}>
                Sorry! You have to be 18 years old or older to volunteer with
                Progressive Victory.
            </p>
        </div>
    )
}
