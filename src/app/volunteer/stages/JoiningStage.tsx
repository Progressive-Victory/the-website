import styles from './stages.module.css'
import { cn } from '@/util'
import { useInit } from '@/util/hooks'
import { FaArrowsRotate } from 'react-icons/fa6'

export interface JoiningStageProps {
    isPending: boolean
    error: Error | null
    onJoin: () => void
}

export function JoiningStage({ isPending, error, onJoin }: JoiningStageProps) {
    useInit(() => onJoin())

    return (
        <div className={styles.container}>
            {error ? (
                <>
                    <p className={cn(styles.subtitle, styles.error)}>
                        An error occurred
                    </p>
                    <p className={cn(styles.text, styles.error)}>
                        {error.message}
                    </p>
                    <button
                        type="submit"
                        disabled={isPending}
                        onClick={onJoin}
                        className={styles.button}
                    >
                        Try Again
                    </button>
                </>
            ) : (
                <>
                    {
                        <FaArrowsRotate
                            className={cn(styles.icon, styles.spin)}
                        />
                    }
                    <p className={styles.subtitle}>
                        Joining you to the server...
                    </p>
                </>
            )}

            <p className={styles.supportNote}>
                If the join form is not working for you, please email us at:
                support@progress.win
            </p>
        </div>
    )
}
