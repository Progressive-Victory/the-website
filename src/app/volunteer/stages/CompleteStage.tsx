import styles from './stages.module.css'
import { cn } from '@/util'
import { FaCakeCandles, FaTrophy } from 'react-icons/fa6'

export interface CompleteStageProps {
    isInServer: boolean
    isPending: boolean
    onRejoin: () => void
}

export function CompleteStage({
    isInServer,
    isPending,
    onRejoin,
}: CompleteStageProps) {
    const Icon = isInServer ? FaCakeCandles : FaTrophy
    const subtitle = isInServer
        ? 'Congrats, you are in the server!'
        : "Looks like you're no longer in the server!"
    const text = isInServer
        ? 'Check your Discord client to start participating in the community.'
        : 'Click the button below to rejoin.'

    return (
        <div className={styles.container}>
            <Icon className={cn(styles.icon, styles.success)} />
            <p className={styles.subtitle}>{subtitle}</p>
            <p className={styles.text}>{text}</p>
            {!isInServer && (
                <button
                    disabled={isPending}
                    onClick={onRejoin}
                    className={styles.button}
                >
                    Rejoin
                </button>
            )}
        </div>
    )
}
