import { Field, SupportNote } from '.'
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
                body: JSON.stringify({
                    code,
                }),
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
            <div className="flex w-full flex-col items-center gap-0 md:min-w-96">
                <p className="font-white text-center text-lg font-bold text-white">
                    Enter your Verification Code
                </p>
                <p className="mx-2 mb-2 text-center text-lg font-medium text-white">
                    We just sent it to your phone 📱
                </p>

                <div className="mt-2 flex w-full flex-row justify-center gap-1">
                    <Field
                        value={securityCode}
                        placeholder="Security Code"
                        error={checkCodeMutation.isError}
                        // Let users input with enter key
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
                                `flex w-fit items-center whitespace-nowrap rounded-lg bg-steel-blue px-4 py-3 text-center text-sm text-white transition-all duration-100 disabled:cursor-not-allowed [&:not(:disabled)]:hover:scale-[103%]`,
                                requestCodeMutation.isPending
                                    ? ''
                                    : 'hover:bg-valencia disabled:bg-gray-500'
                            )}
                            onClick={() => {
                                // Get a new OTP
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
                                            className="font-mono"
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
                    className="my-4 w-full rounded-md bg-steel-blue py-2 text-center text-lg font-bold text-white transition-all duration-100 hover:bg-valencia disabled:cursor-not-allowed disabled:bg-gray-500 [&:not(:disabled)]:hover:scale-[103%]"
                >
                    Verify
                </button>

                <button
                    type="button"
                    onClick={() => void goBack()}
                    className="mx-auto text-center text-xs text-steel-blue underline hover:text-white"
                >
                    I made a mistake!
                </button>
            </div>

            <SupportNote />
        </div>
    )
}
