import { Field, SupportNote } from '.'
import classNames from 'classnames'
import { ChangeEvent, useEffect, useState } from 'react'
import { PulseLoader } from 'react-spinners'

export interface PhoneVerifyProps {
    lastSmsCodeSendTimeUtc: Date | null
    requestIsPending: boolean
    verifyIsPending: boolean
    verifyError: Error | null
    onReturn: () => void
    onRequest: () => void
    onVerify: (code: number) => void
    onCancelVerify: () => void
}

export function PhoneVerifyStage({
    lastSmsCodeSendTimeUtc,
    requestIsPending,
    verifyIsPending,
    verifyError,
    onReturn,
    onRequest,
    onVerify,
    onCancelVerify,
}: PhoneVerifyProps) {
    const [securityCode, setSecurityCode] = useState('')
    const [autoSent, setAutoSent] = useState(false)
    const [codeTimer, setCodeTimer] = useState(0)

    const updateCodeTimer = (timer: Date | null) => {
        if (!timer) {
            setCodeTimer(0)
        } else {
            const elapsed = Date.now() - timer.getTime()
            const remaining = 1000 * 60 - elapsed
            setCodeTimer(Math.ceil(remaining / 1000))
        }
    }

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        if (!value || !isNaN(+value)) {
            setSecurityCode(value)
            onCancelVerify()
        }
    }

    const handleVerify = () => {
        if (securityCode.length === 6) onVerify(+securityCode)
    }

    useEffect(() => {
        updateCodeTimer(lastSmsCodeSendTimeUtc)
        const interval = setInterval(() => {
            updateCodeTimer(lastSmsCodeSendTimeUtc)
        }, 200)
        return () => clearInterval(interval)
    }, [lastSmsCodeSendTimeUtc])

    useEffect(() => {
        if (!autoSent) {
            onRequest()
            setAutoSent(true)
        }
    }, [autoSent, onRequest])

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
                        error={verifyError != null}
                        errorText={verifyError?.message}
                        maxLength={6}
                        onChange={handleChange}
                        disabled={false}
                    >
                        <button
                            type="button"
                            disabled={codeTimer > 0 || requestIsPending}
                            className={classNames(
                                `flex w-fit items-center whitespace-nowrap rounded-lg bg-steel-blue px-4 py-3 text-center text-sm text-white transition-all duration-100 disabled:cursor-not-allowed [&:not(:disabled)]:hover:scale-[103%]`,
                                requestIsPending
                                    ? ''
                                    : 'hover:bg-valencia disabled:bg-gray-500'
                            )}
                            onClick={onRequest}
                        >
                            {requestIsPending ? (
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
                    onClick={handleVerify}
                    disabled={securityCode.length < 6 || verifyIsPending}
                    className="my-4 w-full rounded-md bg-steel-blue py-2 text-center text-lg font-bold text-white transition-all duration-100 hover:bg-valencia disabled:cursor-not-allowed disabled:bg-gray-500 [&:not(:disabled)]:hover:scale-[103%]"
                >
                    Verify
                </button>

                <button
                    type="button"
                    disabled={verifyIsPending}
                    onClick={onReturn}
                    className="mx-auto text-center text-xs text-steel-blue underline hover:text-white"
                >
                    I made a mistake!
                </button>
            </div>

            <SupportNote />
        </div>
    )
}
