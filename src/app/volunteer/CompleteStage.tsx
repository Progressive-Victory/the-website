import styles from './volunteer.module.css'
import { CakeIcon, TrophyIcon } from '@heroicons/react/24/solid'

export interface CompleteStageProps {
    isInServer: boolean
    onRejoin: () => void
}

export function CompleteStage({ isInServer, onRejoin }: CompleteStageProps) {
    return (
        <div className={styles.container}>
            {!isInServer ? (
                <>
                    <TrophyIcon className={styles.icon} />
                    <p className={styles.title}>
                        Looks like you&apos;re no longer in the server!
                    </p>
                    <p className={styles.subtitle}>
                        Click the button below to rejoin.
                    </p>
                    <button onClick={onRejoin} className={styles.rejoinButton}>
                        Rejoin
                    </button>
                </>
            ) : (
                <>
                    <CakeIcon className={styles.icon} />
                    <p className={styles.title}>
                        Congrats, you are in the server!
                    </p>
                    <p className={styles.subtitle}>
                        Check your Discord client to start participating in the
                        community.
                    </p>
                </>
            )}
        </div>
    )
}
