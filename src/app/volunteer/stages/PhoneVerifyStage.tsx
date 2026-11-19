import { Field } from './components'
import styles from './stages.module.css'
import { cn } from '@/util'
import { useInit } from '@/util/hooks'
import { ChangeEvent, useCallback, useEffect, useState } from 'react'
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
    useInit(() => onRequest())

    const getCodeTime = useCallback(() => {
        if (!lastSmsCodeSendTimeUtc) return 0
        const elapsed = Date.now() - lastSmsCodeSendTimeUtc.getTime()
        const remaining = 1000 * 60 - elapsed
        return Math.ceil(remaining / 1000)
    }, [lastSmsCodeSendTimeUtc])

    const [securityCode, setSecurityCode] = useState('')
    const [codeTimer, setCodeTimer] = useState(0)

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
        setCodeTimer(getCodeTime())
        const interval = setInterval(() => {
            setCodeTimer(getCodeTime())
        }, 200)
        return () => clearInterval(interval)
    }, [getCodeTime])

    return (
        <div className={styles.container}>
            <p className={styles.subtitle}>Enter your Verification Code</p>
            <p className={styles.text}>We just sent it to your phone 📱</p>

            <div className={styles.verifyFormRow}>
                <Field
                    value={securityCode}
                    label="Security Code"
                    error={verifyError != null}
                    errorText={verifyError?.message}
                    maxLength={6}
                    onChange={handleChange}
                    disabled={false}
                >
                    <button
                        type="button"
                        disabled={codeTimer > 0 || requestIsPending}
                        className={cn(styles.button, styles.submit)}
                        onClick={onRequest}
                    >
                        {requestIsPending ? (
                            <PulseLoader color="#ffffff" size={8} />
                        ) : (
                            <>
                                Resend{' '}
                                {codeTimer > 0 && (
                                    <span className={styles.monospace}>
                                        {codeTimer}
                                    </span>
                                )}
                            </>
                        )}
                    </button>
                </Field>
            </div>

            <button
                type="submit"
                onClick={handleVerify}
                disabled={securityCode.length < 6 || verifyIsPending}
                className={cn(styles.button, styles.submit)}
            >
                Verify
            </button>

            <button
                type="button"
                disabled={verifyIsPending}
                onClick={onReturn}
                className={styles.hyper}
            >
                I made a mistake!
            </button>

            <p className={styles.supportNote}>
                If the join form is not working for you, please email us at:
                support@progress.win
            </p>
        </div>
    )
}
