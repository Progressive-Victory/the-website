import styles from './stages.module.css'
import { cn } from '@/util'
import { CakeIcon, TrophyIcon } from '@heroicons/react/24/solid'
import { redirect } from 'next/navigation'

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
    const Icon = isInServer ? CakeIcon : TrophyIcon
    const subtitle = isInServer
        ? 'Congrats, you are in the server!'
        : "Looks like you're no longer in the server!"
    const text = isInServer
        ? 'Check your Discord client to start participating in the community.'
        : 'Click the button below to rejoin.'
    const subtext =
        'Or, visit your account page to tell us more about yourself.'

    const redirectToAccount = () => redirect('/account')

    return (
        <div className={styles.container}>
            <Icon className={cn(styles.icon, styles.success)} />
            <p className={styles.subtitle}>{subtitle}</p>
            <p className={styles.text}>{text}</p>

            {isInServer ? (
                <p className={styles.text}>{subtext}</p>
            ) : (
                <button
                    disabled={isPending}
                    onClick={onRejoin}
                    className={styles.button}
                >
                    Rejoin
                </button>
            )}
            <button
                disabled={isPending}
                onClick={redirectToAccount}
                className={styles.button}
            >
                Account Page
            </button>
        </div>
    )
}
