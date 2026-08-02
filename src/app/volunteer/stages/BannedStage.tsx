import styles from './stages.module.css'
import { cn } from '@/util'
import { FaBan } from 'react-icons/fa6'
import { useInit } from '@/util/hooks'

interface BannedStageProps {
    isPending: boolean
    onUnban: () => void
}

export function BannedStage({ isPending, onUnban }: BannedStageProps) {
    useInit(() => onUnban())
    return (
        <div className={styles.container}>
            <FaBan className={cn(styles.icon, styles.error)} />
            <p className={styles.subtitle}>
                You have been banned from the discord server.
            </p>
            <p className={styles.text}>
                You can appeal by reaching out to:{' '}
                <a href="community@progress.win" className={styles.hyper}>
                    community@progress.win
                </a>
            </p>
            <button
                disabled={isPending}
                onClick={onUnban}
                className={styles.button}
            >
                Check again
            </button>
        </div>
    )
}
