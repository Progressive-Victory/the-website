'use client'

import styles from './login.module.css'
import { cn } from '@/util'
import { useAuth } from '@/util/hooks'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'

export function LoginCard() {
    const { session, onLogin } = useAuth()

    const params = useSearchParams()

    const redirect = params.get('redirect') ?? '/account'
    const error = params.get('error')

    const errorMessage =
        error == 'DiscordEmailNotVerified'
            ? 'Your Discord email is not verified! Please go verify it and then try again.'
            : error == '401'
              ? 'Please log in to view that page.'
              : error
                ? 'An unknown error occurred. Please try again later.'
                : null

    if (session) {
        window.location.href = redirect
        return null
    }

    return (
        <div className={styles.card}>
            <h1 className={styles.cardTitle}>Log In to Continue</h1>
            {errorMessage && (
                <p className={styles.cardError}>ERROR: {errorMessage}</p>
            )}
            <p className={styles.cardText}>
                Click the button below to log in. If you haven&apos;t completed
                the onboarding form yet, you&apos;ll be prompted to do that
                before you can join the server.
                <br />
                <br />
                <strong className={styles.highlight}>
                    NOTE: Your Discord account MUST have a verified email
                </strong>
            </p>
            <button
                onClick={() => void onLogin(redirect)}
                className={cn(styles.cardLoginButton, styles.discord)}
            >
                <Image
                    src="/images/discord-white-icon.png"
                    alt="discord-logo"
                    width={32}
                    height={32}
                />
                Sign In with Discord
            </button>
        </div>
    )
}
