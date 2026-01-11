import { Field, SupportNote } from '.'
import styles from './volunteer.module.css'
import { useInit } from '@/util/hooks'
import { QueryClient, useMutation } from '@tanstack/react-query'
import classNames from 'classnames'
import { useEffect, useState } from 'react'
import { PulseLoader } from 'react-spinners'

export interface PhoneVerifyProps {
    queryClient: QueryClient
    phoneNumber: string
    lastSmsCodeSentAt: Date | null
    goBack: () => void
    onSuccess: () => void
}

export function PhoneVerifyStage({
    queryClient,
    phoneNumber,
    lastSmsCodeSentAt,
    goBack,
    onSuccess,
}: PhoneVerifyProps) {
    const [securityCode, setSecurityCode] = useState('')
    const [codeSentAt, setCodeSentAt] = useState(lastSmsCodeSentAt)
    const [codeTimer, setCodeTimer] = useState(
        codeSentAt ? calculateSecondsRemaining(codeSentAt) : 0
    )

    const requestCodeMutation = useMutation({
        mutationFn: async (phone: string) => {
            if (codeTimer > 0) return

            const resp = await fetch('/api/onboarding/sms/send', {
                method: 'POST',
                body: JSON.stringify({ number: phone }),
            })

            if (resp.ok) {
                await queryClient.invalidateQueries({ queryKey: ['user'] })
                return
            }

            if (resp.status === 429) {
                alert('Too many requests received. Please try again later.')
            } else {
                alert('Failed to send code! Please try again later.')
            }
            throw new Error()
        },
    })

    const checkCodeMutation = useMutation({
        mutationFn: async (code: string) => {
            const resp = await fetch('/api/onboarding/sms/check', {
                method: 'POST',
                body: JSON.stringify({ code }),
            })

            if (resp.status === 200) {
                onSuccess()
            } else {
                throw new Error()
            }
        },
    })

    function calculateSecondsRemaining(sentAt: Date) {
        const elapsed = Date.now() - sentAt.getTime()
        const remaining = 1000 * 60 - elapsed
        return Math.floor(remaining / 1000)
    }

    useEffect(() => {
        if (requestCodeMutation.isSuccess) {
            setCodeSentAt(new Date())
        }
    }, [requestCodeMutation.isSuccess])

    useEffect(() => {
        if (!codeSentAt) return

        const interval = setInterval(() => {
            setCodeTimer(calculateSecondsRemaining(codeSentAt))
        }, 100)

        return () => {
            clearInterval(interval)
        }
    }, [codeSentAt])

    useInit(() => {
        setTimeout(() => {
            requestCodeMutation.mutate(phoneNumber)
        }, 200)
    })

    return (
        <div>
            <div className={styles.verifyContainer}>
                <p className={styles.verifyTitle}>
                    Enter your Verification Code
                </p>
                <p className={styles.verifySubtitle}>
                    We just sent it to your phone 📱
                </p>

                <div className={styles.fieldRow}>
                    <Field
                        value={securityCode}
                        placeholder="Security Code"
                        error={checkCodeMutation.isError}
                        onEnter={() => {
                            if (securityCode.length === 6) {
                                checkCodeMutation.mutate(securityCode)
                            }
                        }}
                        errorText="Invalid or expired code, try a new one"
                        maxLength={6}
                        onChange={(e) => {
                            const re = /^[0-9\b]+$/
                            if (
                                e.target.value === '' ||
                                re.test(e.target.value)
                            ) {
                                setSecurityCode(e.target.value)
                            }

                            checkCodeMutation.reset()
                        }}
                        disabled={false}
                    >
                        <button
                            type="button"
                            disabled={
                                codeTimer > 0 || requestCodeMutation.isPending
                            }
                            className={classNames(
                                styles.resendButton,
                                requestCodeMutation.isPending
                                    ? styles.resendButtonPending
                                    : styles.resendButtonReady
                            )}
                            onClick={() => {
                                requestCodeMutation.mutate(phoneNumber)
                            }}
                        >
                            {requestCodeMutation.isPending ? (
                                <PulseLoader color="#ffffff" size={8} />
                            ) : (
                                <span>
                                    Resend{' '}
                                    {codeTimer > 0 && (
                                        <span
                                            className={styles.timerMono}
                                            suppressHydrationWarning
                                        >
                                            {codeTimer}
                                        </span>
                                    )}
                                </span>
                            )}
                        </button>
                    </Field>
                </div>

                <button
                    type="submit"
                    onClick={() => {
                        if (securityCode.length === 6) {
                            checkCodeMutation.mutate(securityCode)
                        }
                    }}
                    disabled={
                        securityCode.length < 6 || checkCodeMutation.isPending
                    }
                    className={styles.verifyButton}
                >
                    Verify
                </button>

                <button
                    type="button"
                    onClick={() => void goBack()}
                    className={styles.goBackButton}
                >
                    I made a mistake!
                </button>
            </div>

            <SupportNote />
        </div>
    )
}
