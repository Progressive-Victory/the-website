import { SupportNote } from '.'
import styles from './volunteer.module.css'
import { useInit } from '@/util/hooks'
import { ArrowPathIcon } from '@heroicons/react/24/solid'
import { QueryClient, useMutation } from '@tanstack/react-query'
import { signOut } from 'next-auth/react'

export interface JoiningStageProps {
    queryClient: QueryClient
    onSuccess: () => void
}

export function JoiningStage({ queryClient, onSuccess }: JoiningStageProps) {
    const joinToServerMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch('/api/onboarding/discord/join', {
                method: 'POST',
            })

            if (res.ok) {
                await queryClient.invalidateQueries({ queryKey: ['user'] })
                onSuccess()
            } else {
                try {
                    const data = (await res.json()) as { code: string }

                    console.error('Failed to join server:', res)

                    if (data.code === 'INVALID_OAUTH2_ACCESS_CODE') {
                        await signOut({ callbackUrl: '/login' })
                    } else if (data.code === 'DISCORD_EMAIL_NOT_VERIFIED') {
                        throw new Error(
                            'Your Discord email is not verified! Please verify it and then try again.'
                        )
                    }

                    throw new Error(
                        data.code ??
                            'An unknown error occurred. Please try again or contact the email below if the issue persists'
                    )
                } catch (e) {
                    console.error('Failed to parse join server response:', e)
                    throw new Error(
                        'Failed to join Discord server (unknown error)'
                    )
                }
            }
        },
    })

    useInit(() => {
        joinToServerMutation.mutate()
    })

    return (
        <div>
            <div className={styles.container}>
                {joinToServerMutation.isError ? (
                    <>
                        <p className={styles.errorTitle}>Error</p>

                        <p className={styles.errorMessage}>
                            {joinToServerMutation.error.message}
                        </p>

                        <button
                            type="button"
                            onClick={() => joinToServerMutation.mutate()}
                            className={styles.retryButton}
                            disabled={joinToServerMutation.isPending}
                        >
                            Try Again
                        </button>
                    </>
                ) : (
                    <>
                        <ArrowPathIcon className={styles.spinner} />
                        <p className={styles.loadingText}>
                            Joining you to the server...
                        </p>
                    </>
                )}
            </div>

            <SupportNote />
        </div>
    )
}
