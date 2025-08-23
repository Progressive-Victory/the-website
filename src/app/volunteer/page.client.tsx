'use client'

import { Field, Stage, Toggle } from '@/app/volunteer'
import { MainLayout } from '@/components/layout'
import { IUser } from '@/models/User'
import { OnboardingStage } from '@/util/stage'
import { ArrowPathIcon, CakeIcon, TrophyIcon } from '@heroicons/react/24/solid'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import classNames from 'classnames'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import phone from 'phone'
import { useEffect, useMemo, useState } from 'react'
import { PulseLoader } from 'react-spinners'

export interface VolunteerPageProps {
    user: IUser
    isInSever: boolean
}

type FormStage = 'collect_info' | 'phone_verify' | 'joining' | 'complete'

export default function VolunteerPage({
    user: initialUser,
    isInSever: initialIsInServer,
}: VolunteerPageProps) {
    const queryClient = useQueryClient()

    const userQuery = useQuery({
        queryKey: ['user'],
        async queryFn() {
            // @ts-expect-error shut up
            initialUser = null

            const response = await fetch('/api/user')
            return (await response.json()) as Partial<IUser>
        },
        initialData: initialUser,
    })

    const updateUserMutation = useMutation({
        mutationFn: async (obj: Partial<IUser>) => {
            const resp = await fetch('/api/user', {
                method: 'PATCH',
                body: JSON.stringify(obj),
            })

            if (resp.status === 200) {
                const data = await resp.json()
                queryClient.setQueryData(['user'], () => data)

                return
            }

            throw new Error()
        },
    })

    const requestCodeMutation = useMutation({
        mutationFn: async (phone: string) => {
            if (codeTimer > 0) return

            const resp = await fetch('/api/onboarding/sms/send', {
                method: 'POST',
                body: JSON.stringify({ number: phone }),
            })

            if (resp.ok) {
                queryClient.invalidateQueries({ queryKey: ['user'] })
                setCodeSentAt(new Date())
                return
            }

            if (resp.status === 429) {
                alert('Too many requests received. Please try again later.')
            } else {
                alert('Failed to send code! Please try again later.')
            }

            console.log('Failed to send code:', resp)
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
                joinToServerMutation.mutate()
                setCurrentStage('joining')
            } else {
                throw new Error()
            }
        },
    })

    const joinToServerMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch('/api/onboarding/discord/join', {
                method: 'POST',
            })

            if (res.ok) {
                queryClient.invalidateQueries({ queryKey: ['user'] })
                setIsInServer(true)
                setCurrentStage('complete')
            } else {
                try {
                    // Not every response will have JSON but errors should
                    var data = await res.json()
                } catch (e) {
                    console.error('Failed to parse join server response:', e)
                    throw new Error(
                        'Failed to join Discord server (unknown error)'
                    )
                }

                console.error('Failed to join server:', res)

                if (data.code === 'INVALID_OAUTH2_ACCESS_CODE') {
                    await signOut({
                        callbackUrl: '/login',
                    })
                } else if (data.code === 'DISCORD_EMAIL_NOT_VERIFIED') {
                    throw new Error(
                        'Your Discord email is not verified! Please verify it and then try again.'
                    )
                }

                throw new Error(
                    data.code ??
                        'An unknown error occurred. Please try again or contact the email below if the issue persists'
                )
            }
        },
    })

    const initialStage = useMemo<FormStage>(() => {
        if (userQuery.data.onboardingStage === OnboardingStage.NOT_STARTED) {
            return 'collect_info'
        } else if (
            userQuery.data.onboardingStage ===
            OnboardingStage.AWAIT_VERIFICATION
        ) {
            return 'phone_verify'
        } else if (
            userQuery.data.onboardingStage === OnboardingStage.VERIFIED
        ) {
            joinToServerMutation.mutateAsync()
            return 'joining'
        } else if (userQuery.data.onboardingStage === OnboardingStage.JOINED) {
            return 'complete'
        }

        return 'collect_info'
    }, [])
    const [currentStage, setCurrentStage] = useState<FormStage>(
        initialStage as FormStage
    )

    const [firstName, setFirstName] = useState<string>('')
    const [lastName, setLastName] = useState<string>('')
    const [dateOfBirth, setDateOfBirth] = useState<string>('')
    const [phoneNumber, setPhoneNumber] = useState<string>('')
    const [zipCode, setZipCode] = useState<string>('')

    const [getAlerts, setGetAlerts] = useState<boolean>(false)
    const [usCitizen, setUsCitizen] = useState<boolean>(false)
    const [privacyPolicy, setPrivacyPolicy] = useState<boolean>(false)

    const [securityCode, setSecurityCode] = useState<string>('')
    const [codeSentAt, setCodeSentAt] = useState<Date | null>(
        (initialUser.lastSmsCodeSentAt &&
            new Date(initialUser.lastSmsCodeSentAt)) ??
            null
    )
    const [codeTimer, setCodeTimer] = useState<number>(
        codeSentAt ? calculate_seconds_remaining(codeSentAt) : 0
    )

    function calculate_seconds_remaining(sent_at: Date) {
        const elapsed = Date.now() - sent_at.getTime()
        const remaining = 1_000 * 60 - elapsed

        return Math.floor(remaining / 1_000)
    }

    useEffect(() => {
        if (!codeSentAt) return

        const interval = setInterval(() => {
            setCodeTimer(calculate_seconds_remaining(codeSentAt))
        }, 100)

        return () => {
            clearInterval(interval)
        }
    }, [codeSentAt])

    const [validationFlags, setValidationFlags] = useState<
        Record<string, boolean>
    >({
        first_name: false,
        last_name: false,
        date_of_birth: false,
        phone_number: false,
        zip_code: false,
    })

    const [isInServer, setIsInServer] = useState(initialIsInServer)

    return (
        <MainLayout>
            <div className="relative flex min-h-screen flex-col items-center justify-center bg-steel-blue">
                <div className="halftone z-1 absolute left-0 top-0 size-full opacity-10" />
                <div
                    className="absolute right-0 top-0 size-full lg:w-1/2 lg:translate-x-1/2"
                    style={{
                        backgroundImage: "url('/images/blend_test.png')",
                        backgroundSize: 'cover',
                        backgroundPosition: 'right',
                        mixBlendMode: 'lighten',
                        transform: 'scaleX(-1)',
                    }}
                />
                <div className="flex w-full justify-center">
                    <form
                        onSubmit={async (e) => {
                            e.preventDefault()

                            if (currentStage === 'collect_info') {
                                console.log('submitting')
                                await updateUserMutation.mutateAsync({
                                    firstName,
                                    lastName,
                                    phoneNumber,
                                    zipCode,
                                    acceptedAlerts: getAlerts,
                                })
                                requestCodeMutation.mutate(phoneNumber)
                                setCurrentStage('phone_verify')
                            }
                        }}
                        className="z-0 m-4 flex h-auto max-w-[33rem] flex-col gap-y-4 rounded-lg bg-black-pearl-dark p-4 shadow-md md:m-8 md:p-6"
                    >
                        {/* User is authenticated and needs to do onboarding */}
                        <Stage
                            stageName="collect_info"
                            currentStage={currentStage}
                        >
                            <header>
                                <p className="mx-auto text-center text-3xl font-bold text-white">
                                    Volunteer with PV
                                </p>
                                <p className="mx-2 mb-2 text-center text-lg font-medium text-white">
                                    Join us on Discord and make a difference ✨
                                </p>
                            </header>
                            <section className="flex flex-col gap-2">
                                <Field
                                    value={firstName}
                                    placeholder="First Name"
                                    error={!validationFlags['first_name']}
                                    errorText="Enter a valid name with no special characters"
                                    maxLength={40} // sensible default, may be too premissive
                                    onChange={(e) => {
                                        const text = e.target.value
                                        setFirstName(text)
                                        const isValid =
                                            /^[A-Za-z. \s_-]*$/g.test(text) &&
                                            text.trim() !== ''

                                        setValidationFlags({
                                            ...validationFlags,
                                            first_name: isValid,
                                        })
                                    }}
                                />
                                <Field
                                    value={lastName}
                                    placeholder="Last Name"
                                    error={!validationFlags['last_name']}
                                    errorText="Enter a valid name with no special characters"
                                    maxLength={40} // sensible default, may be too permissive
                                    onChange={(e) => {
                                        const text = e.target.value
                                        setLastName(text)
                                        setLastName(text)
                                        const isValid =
                                            /^[A-Za-z. \s_-]*$/g.test(text) &&
                                            text.trim() !== ''

                                        setValidationFlags({
                                            ...validationFlags,
                                            last_name: isValid,
                                        })
                                    }}
                                />
                                <Field
                                    type="date"
                                    value={dateOfBirth}
                                    placeholder="Date of Birth"
                                    error={!validationFlags['date_of_birth']}
                                    errorText="Must be 16 or older"
                                    maxLength={40} // sensible default, may be too permissive
                                    onInput={(e) => {
                                        const date = e.target.value
                                        setDateOfBirth(date)
                                        const isValid = !!date

                                        setValidationFlags({
                                            ...validationFlags,
                                            date_of_birth: isValid,
                                        })
                                    }}
                                />
                                <Field
                                    value={phoneNumber}
                                    placeholder="Phone Number"
                                    error={!validationFlags['phone_number']}
                                    errorText="Enter a valid 10 digit phone, e.g., 1234567890"
                                    maxLength={12}
                                    onChange={(e) => {
                                        const text = e.target.value
                                        setPhoneNumber(text)

                                        const parsed = phone(text, {
                                            strictDetection: true,
                                            validateMobilePrefix: true,
                                        })

                                        setValidationFlags({
                                            ...validationFlags,
                                            phone_number: parsed.isValid,
                                        })
                                    }}
                                />
                                <p
                                    className={`-mt-0.5 mb-1 text-[12px] text-gray-300`}
                                >
                                    <em>
                                        US numbers only. Message and data rates
                                        may apply. Must be SMS reachable.
                                    </em>
                                </p>
                                <Field
                                    value={zipCode}
                                    placeholder="Zip Code"
                                    error={!validationFlags['zip_code']}
                                    errorText="Enter a valid zip code"
                                    maxLength={10}
                                    onChange={(e) => {
                                        const text = e.target.value
                                        setZipCode(text)
                                        const isValid =
                                            /^\d{5}(-\d{4})?$/g.test(text)

                                        setValidationFlags({
                                            ...validationFlags,
                                            zip_code: isValid,
                                        })
                                    }}
                                />
                            </section>
                            <section className="flex flex-col gap-2">
                                <Toggle
                                    name="subscribe-alerts"
                                    value={getAlerts}
                                    placeholder="I want to receive community updates"
                                    tooltip="Alerts may be delivered to your phone and/or email periodically. Text STOP to opt-out."
                                    onChange={() => {
                                        setGetAlerts(!getAlerts)
                                    }}
                                />
                                <Toggle
                                    name="us-citizen"
                                    value={usCitizen}
                                    placeholder={
                                        <span>
                                            <span className="text-red-500">
                                                *
                                            </span>{' '}
                                            I swear that I am a resident (or
                                            citizen living abroad) of the United
                                            States of America
                                        </span>
                                    }
                                    tooltip="Only US residents and citizens may participate in Progressive Victory"
                                    onChange={() => {
                                        setUsCitizen(!usCitizen)
                                    }}
                                    required
                                />
                                <Toggle
                                    name="accept-privacy"
                                    value={privacyPolicy}
                                    placeholder={
                                        <span>
                                            <span className="text-red-500">
                                                *
                                            </span>{' '}
                                            I agree to the{' '}
                                            <Link
                                                href="/privacy"
                                                target="_blank"
                                                referrerPolicy="no-referrer"
                                                className="text-steel-blue underline"
                                            >
                                                Privacy Policy
                                            </Link>
                                        </span>
                                    }
                                    tooltip="You are agreeing to the usage of your data as described by the policy"
                                    onChange={() => {
                                        setPrivacyPolicy(!privacyPolicy)
                                    }}
                                    required
                                />
                            </section>
                            <div className="w-full px-1 text-left text-xs text-white">
                                <span className="text-red-500">*</span> =
                                required field
                            </div>
                            <button
                                type="submit"
                                disabled={
                                    updateUserMutation.isPending ||
                                    !privacyPolicy ||
                                    !usCitizen
                                }
                                className="w-full rounded-md bg-steel-blue py-2 text-lg font-bold text-white transition-all duration-100 hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-500 [&:not(:disabled)]:hover:scale-[101%]"
                            >
                                Join Now
                            </button>
                        </Stage>
                        {/* Phone verification state presentation */}
                        <Stage
                            stageName="phone_verify"
                            currentStage={currentStage}
                        >
                            <div className="flex w-full flex-col items-center gap-0 md:min-w-[24rem]">
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
                                                checkCodeMutation.mutate(
                                                    securityCode
                                                )
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
                                                codeTimer > 0 ||
                                                requestCodeMutation.isPending
                                            }
                                            className={classNames(
                                                `flex w-fit items-center whitespace-nowrap rounded-lg bg-steel-blue px-4 py-3 text-center text-sm text-white transition-all duration-100 disabled:cursor-not-allowed [&:not(:disabled)]:hover:scale-[101%]`,
                                                requestCodeMutation.isPending
                                                    ? ''
                                                    : 'hover:bg-blue-600 disabled:bg-gray-500'
                                            )}
                                            onClick={() => {
                                                // Get a new OTP
                                                requestCodeMutation.mutate(
                                                    phoneNumber !== ''
                                                        ? phoneNumber
                                                        : (userQuery.data
                                                              ?.phoneNumber ??
                                                              '')
                                                )
                                            }}
                                        >
                                            {requestCodeMutation.isPending ? (
                                                <PulseLoader
                                                    color="#ffffff"
                                                    size={8}
                                                />
                                            ) : (
                                                <>
                                                    Resend
                                                    {codeTimer > 0 && (
                                                        <span
                                                            className="font-mono"
                                                            suppressHydrationWarning
                                                        >
                                                            {' '}
                                                            ({codeTimer})
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                        </button>
                                    </Field>
                                </div>

                                <button
                                    type="submit"
                                    onClick={() => {
                                        if (securityCode.length === 6) {
                                            checkCodeMutation.mutate(
                                                securityCode
                                            )
                                        }
                                    }}
                                    disabled={
                                        securityCode.length < 6 ||
                                        checkCodeMutation.isPending
                                    }
                                    className="my-4 w-full rounded-md bg-steel-blue py-2 text-center text-lg font-bold text-white transition-all duration-100 hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-500 [&:not(:disabled)]:hover:scale-[101%]"
                                >
                                    Verify
                                </button>

                                <button
                                    type="button"
                                    onClick={async () => {
                                        await updateUserMutation.mutateAsync({
                                            onboardingStage:
                                                OnboardingStage.NOT_STARTED,
                                        })
                                        setCurrentStage('collect_info')
                                    }}
                                    className="mx-auto text-center text-xs text-steel-blue underline hover:text-white"
                                >
                                    I made a mistake!
                                </button>
                            </div>
                        </Stage>
                        {/* Onboarding done need to join them to server now*/}
                        <Stage stageName="joining" currentStage={currentStage}>
                            <div className="flex min-h-[200px] flex-col items-center justify-center p-4">
                                {joinToServerMutation.isError ? (
                                    <>
                                        <p className="font-white text-center text-xl font-bold text-red-400">
                                            Error
                                        </p>
                                        <p className="mx-2 mb-2 max-w-[20rem] text-center text-sm font-medium text-red-400">
                                            {joinToServerMutation.error.message}
                                        </p>
                                        <button
                                            type="submit"
                                            onClick={() =>
                                                joinToServerMutation.mutate()
                                            }
                                            className="my-4 w-full rounded-md bg-steel-blue py-2 text-center text-lg font-bold text-white transition-all duration-100 hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-500 [&:not(:disabled)]:hover:scale-[101%]"
                                        >
                                            Try Again
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <ArrowPathIcon className="size-8 animate-spin text-white" />
                                        <p className="mt-6 text-center text-lg font-bold text-white">
                                            Joining you to the server...
                                        </p>
                                    </>
                                )}
                            </div>
                        </Stage>
                        <Stage stageName="complete" currentStage={currentStage}>
                            <div className="flex min-h-[200px] flex-col items-center justify-center p-4">
                                {!isInServer ? (
                                    <>
                                        <TrophyIcon className="size-12 text-steel-blue" />
                                        <p className="mt-6 text-center text-lg font-bold text-white">
                                            Looks like you're no longer in the
                                            server!
                                        </p>
                                        <p className="mb-2 mt-2 text-center text-sm text-white">
                                            Click the button below to rejoin the
                                            server.
                                        </p>
                                        <button
                                            onClick={() => {
                                                joinToServerMutation.mutate()
                                                setCurrentStage('joining')
                                            }}
                                            className="mt-2 rounded-full bg-valencia px-4 py-2 font-bold text-white hover:bg-red-900"
                                        >
                                            Rejoin
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <CakeIcon className="size-12 text-steel-blue" />
                                        <p className="mt-6 text-center text-lg font-bold text-white">
                                            Congrats you are in the server!
                                        </p>
                                        <p className="mt-6 text-center text-sm text-white">
                                            Check your Discord client to start
                                            participating in the community.
                                        </p>
                                    </>
                                )}
                            </div>
                        </Stage>

                        {currentStage !== 'complete' && (
                            <div className="text-center text-xs font-bold">
                                <p className="text-yellow-200">
                                    <em>
                                        If the join form is not working for you,
                                        please email us at: support@progress.win
                                    </em>
                                </p>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </MainLayout>
    )
}
