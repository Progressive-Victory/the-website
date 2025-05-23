'use client'
import { MainLayout } from '@/components/MainLayout'
import { useEffect, useState, useCallback, useRef } from 'react'
import { ArrowPathIcon, CakeIcon, TrophyIcon } from '@heroicons/react/24/solid'
import { Stage } from '@/components/Stage'
import { Field } from '@/components/Field'
import { Toggle } from '@/components/Toggle'
import { IUser } from '@/models/User'
import { OnboardingStage } from '@/util/stage'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'

export default function Volunteer() {
    const [currentStage, setCurrentStage] = useState<string>('loading')
    const [preferredName, setPreferredName] = useState<string>('')
    const [phoneNumber, setPhoneNumber] = useState<string>('')
    const [zipCode, setZipCode] = useState<string>('')
    const [fromUS, setFromUS] = useState<boolean>(false)
    const [getAlerts, setGetAlerts] = useState<boolean>(false)
    const [privacyPolicy, setPrivacyPolicy] = useState<boolean>(false)
    const [startJoin, setStartJoin] = useState<boolean>(false)
    const [securityCode, setSecurityCode] = useState<string>('')
    const [showRejoin, setShowRejoin] = useState<boolean>(false)
    const [codeError, setCodeError] = useState<boolean>(false)
    const [validationFlags, setValidationFlags] = useState<
        Map<string, boolean>
    >(new Map())
    const [codeTimer, setCodeTimer] = useState<number>(0)
    const [checkingCode, setCheckingCode] = useState<boolean>(false)
    const codeTimerRef = useRef<number>(codeTimer)
    const intervalRef = useRef<NodeJS.Timeout>(null)
    const updateTimer = (newVal: number | ((prev: number) => number)) => {
        setCodeTimer((prev) => {
            const next = typeof newVal === 'function' ? newVal(prev) : newVal
            codeTimerRef.current = next
            return next
        })
    }

    const { status } = useSession()
    const [user, setUser] = useState<Partial<IUser> | undefined>()

    const requestCode = useCallback(async (phone: string) => {
        // guard against spamming if the ref says we're still counting down
        if (codeTimerRef.current > 0) {
            return false
        }

        const resp = await fetch('/api/verify/send', {
            method: 'POST',
            body: JSON.stringify({ number: phone }),
        })

        if (resp.status === 200) {
            getUser()

            // kick off the clock
            updateTimer(60)

            // clear any old interval (just in case)
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }

            intervalRef.current = setInterval(() => {
                updateTimer((prev) => {
                    if (prev <= 1) {
                        // reached zero: stop
                        clearInterval(intervalRef.current ?? undefined)
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)

            return true
        }

        return false
    }, [])

    const joinToServer = useCallback(async () => {
        fetch('/api/discord/join', {
            method: 'PUT',
        }).then(async (response) => {
            if (response.ok) {
                getUser()
            } else {
                // Not every response will have JSON but errors should
                const data = await response.json()
                // The discord code for bad oauth2 we pass back
                if (data && data.code === 50025) {
                    signOut({
                        callbackUrl: '/login',
                    })
                }
            }
        })
    }, [])

    const getUser = async () => {
        const response = await fetch('/api/user')
        const data = await response.json()
        setUser(data as Partial<IUser>)
    }

    const checkCode = async (code: string) => {
        setCheckingCode(true)
        const resp = await fetch('/api/verify/check', {
            method: 'POST',
            body: JSON.stringify({
                code: code,
            }),
        })

        setCheckingCode(false)
        if (resp.status === 200) {
            // Join the user
            joinToServer()
            return true
        } else {
            setCodeError(true)
            return false
        }
    }

    const updateUser = async (data: Partial<IUser>) => {
        const resp = await fetch('/api/user', {
            method: 'PATCH',
            body: JSON.stringify(data),
        })

        if (resp.status === 200) {
            return true
        } else {
            return false
        }
    }

    // Gets the current user object, useful for manipulation as we proceed in flow
    useEffect(() => {
        getUser()
    }, [])

    // Try and join user to server
    useEffect(() => {
        switch (status) {
            case 'loading':
                setCurrentStage('loading')
                break
            case 'unauthenticated':
                setCurrentStage('unauthenticated')
                break
            case 'authenticated':
                if (user) {
                    switch (user.onboardingStage) {
                        case OnboardingStage.NOT_STARTED:
                            setCurrentStage('not_started')
                            break
                        case OnboardingStage.AWAIT_VERIFICATION:
                            setCurrentStage('verification')
                            break
                        case OnboardingStage.VERIFIED:
                            // Check if the user has joined or needs to rejoin the server

                            setCurrentStage('joining')
                            // Join the user
                            fetch('/api/discord/join').then(async (result) => {
                                if (result.status === 404) {
                                    joinToServer()
                                } else {
                                    getUser()
                                    setShowRejoin(false)
                                }
                            })
                            break
                        case OnboardingStage.JOINED:
                            setCurrentStage('joined')
                            fetch('/api/discord/join').then(async (result) => {
                                if (result.status === 404) {
                                    setShowRejoin(true)
                                } else {
                                    setShowRejoin(false)
                                }
                            })
                            break
                        default:
                            setCurrentStage('not_started')
                    }
                }
                break
            default:
                setCurrentStage('unauthenticated')
        }
    }, [user, status, joinToServer])

    // Handles OTP logic and presentation, with form data validation
    useEffect(() => {
        if (startJoin) {
            const validationKeys = ['name', 'phone', 'zip'] // Add if form ever grows
            if (
                validationKeys.some(
                    (key) => validationFlags.get(key) !== false
                ) &&
                !privacyPolicy // all keys and the privacy ticker must be valid
            ) {
                setStartJoin(false)
            } else {
                // Set data on user and upate onboarding stage
                updateUser({
                    preferredName: preferredName,
                    zipCode: fromUS ? '00000' : zipCode, // give them a dummy zip if international
                    phoneNumber: phoneNumber,
                }).then((result) => {
                    if (result) {
                        requestCode(phoneNumber).then((result) => {
                            if (result) {
                                getUser()
                            } else {
                                setStartJoin(false)
                                setValidationFlags((prev) =>
                                    new Map(prev).set('phone', false)
                                )
                                console.error('Could not send OTP!')
                            }
                        })
                    } else {
                        // TODO: an error occured in setting user data
                        console.error('Could not update user profile!')
                    }
                })
            }
        }
    }, [
        startJoin,
        validationFlags,
        phoneNumber,
        privacyPolicy,
        fromUS,
        preferredName,
        zipCode,
        requestCode,
    ])

    return (
        <MainLayout>
            <div className="relative flex h-screen flex-col items-center justify-center bg-steel-blue">
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
                <div className="z-2 absolute left-1/2 top-1/2 flex w-full max-w-[600px] -translate-x-1/2 -translate-y-1/2 flex-col">
                    <div className="relative mx-2 flex flex-col gap-y-4 rounded-lg bg-black-pearl-dark p-4 shadow-md">
                        {/* User is not authenticated and needs to login */}
                        <Stage
                            stageName="unauthenticated"
                            currentStage={currentStage}
                        >
                            <p className="mx-auto my-2 text-center text-3xl font-bold text-white">
                                Volunteer with PV
                            </p>
                            <p className="mx-2 mb-2 text-center text-lg font-medium text-white">
                                Join us on Discord and make a difference ✨
                            </p>
                            <p className="mx-2 mb-2 text-center text-lg font-medium italic text-white">
                                But first you{"'"}ve got to log in...
                            </p>
                            <Link
                                href="/login?redirect=/volunteer"
                                className="mt-4 w-full rounded-md bg-steel-blue py-2 text-center text-lg font-bold text-white transition-all duration-100 hover:scale-[101%] hover:bg-blue-900"
                            >
                                Go to Log In
                            </Link>
                        </Stage>
                        {/* User is authenticated and needs to do onboarding */}
                        <Stage
                            stageName="not_started"
                            currentStage={currentStage}
                        >
                            <p className="mx-auto my-2 text-center text-3xl font-bold text-white">
                                Volunteer with PV
                            </p>
                            <p className="mx-2 mb-2 text-center text-lg font-medium text-white">
                                Join us on Discord and make a difference ✨
                            </p>
                            <Field
                                value={preferredName}
                                placeholder="Preferred Name"
                                error={validationFlags.get('name')}
                                errorText="Enter a valid name with no special characters"
                                maxLength={40} // sensible default, may be too permissive
                                onChange={(e) => {
                                    const text = e.target.value
                                    setPreferredName(text)
                                    const isValid =
                                        /^[A-Za-z. \s_-]*$/g.test(text) &&
                                        text.trim() !== ''
                                    setValidationFlags((prev) =>
                                        new Map(prev).set('name', isValid)
                                    )
                                }}
                            />
                            <Field
                                value={phoneNumber}
                                placeholder="Phone Number"
                                error={validationFlags.get('phone')}
                                errorText="Enter a valid 10 digit phone, e.g., 1234567890"
                                maxLength={10}
                                onChange={(e) => {
                                    const text = e.target.value
                                    setPhoneNumber(text)
                                    const isValid =
                                        /^\d{10}$/g.test(text) &&
                                        text[0] !== '0' &&
                                        text[0] !== '1'

                                    setValidationFlags((prev) =>
                                        new Map(prev).set('phone', isValid)
                                    )
                                }}
                            />
                            <p className={`-mt-2 text-[12px] text-white`}>
                                US numbers only. Message and data rates may
                                apply. Must be SMS reachable.
                            </p>
                            <Field
                                value={zipCode}
                                placeholder="Zip Code"
                                error={validationFlags.get('zip')}
                                errorText="Enter a valid zip code"
                                maxLength={10}
                                onChange={(e) => {
                                    const text = e.target.value
                                    setZipCode(text)
                                    const isValid =
                                        /^\d{5}(-\d{4})?$/g.test(text) &&
                                        text[0] !== '0'
                                    setValidationFlags((prev) =>
                                        new Map(prev).set('zip', isValid)
                                    )
                                }}
                                disabled={fromUS}
                            />
                            <Toggle
                                value={fromUS}
                                placeholder="I'm not from the US"
                                tooltip="We'd love to have you, just not your Zipcode"
                                onChange={() => {
                                    setFromUS(!fromUS)
                                }}
                            />
                            <Toggle
                                value={getAlerts}
                                placeholder="I want to recieve community updates"
                                tooltip="Alerts may be delivered to your phone and/or email periodically. Text STOP to opt-out."
                                onChange={() => {
                                    setGetAlerts(!getAlerts)
                                }}
                            />
                            <Toggle
                                value={privacyPolicy}
                                placeholder={
                                    <span>
                                        <span className="text-red-500">*</span>{' '}
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
                            />
                            <div className="w-full px-1 text-left text-xs text-white">
                                <span className="text-red-500">*</span> =
                                required field
                            </div>
                            <button
                                onClick={() => {
                                    setStartJoin(true)
                                }}
                                disabled={startJoin}
                                className="mt-4 w-full rounded-md bg-steel-blue py-2 text-lg font-bold text-white transition-all duration-100 hover:scale-[101%] hover:bg-blue-900 disabled:bg-gray-500"
                            >
                                Join Now
                            </button>
                        </Stage>
                        {/* Loading indicator for between auth state */}
                        <Stage stageName="loading" currentStage={currentStage}>
                            <div className="flex min-h-[200px] flex-col items-center justify-center p-4">
                                <ArrowPathIcon className="size-8 animate-spin text-white" />
                                <p className="mt-6 text-center text-lg font-bold text-white">
                                    Loading...
                                </p>
                            </div>
                        </Stage>
                        {/* Phone verification state presentation */}
                        <Stage
                            stageName="verification"
                            currentStage={currentStage}
                        >
                            <div className="flex w-full flex-col items-center">
                                <p className="font-white text-center text-lg font-bold text-white">
                                    Enter your Verification Code
                                </p>
                                <p className="mx-2 mb-2 text-center text-lg font-medium text-white">
                                    We just sent it to your phone 📱
                                </p>

                                <div className="flex w-full flex-row items-center justify-center">
                                    <Field
                                        value={securityCode}
                                        placeholder="Security Code"
                                        error={!codeError}
                                        // Let users input with enter key
                                        onEnter={() => {
                                            if (securityCode.length === 6) {
                                                checkCode(securityCode)
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
                                        }}
                                        disabled={false}
                                    />
                                    <button
                                        disabled={codeTimer > 0}
                                        className={`${
                                            codeTimer <= 0
                                                ? 'bg-steel-blue'
                                                : 'bg-gray-500'
                                        } ${
                                            !codeError ? '' : 'mb-[12px]'
                                        } ml-2 mt-auto w-fit whitespace-nowrap rounded-lg px-2 py-3 text-center text-sm text-white`}
                                        onClick={() => {
                                            // Get a new OTP
                                            requestCode(
                                                phoneNumber !== ''
                                                    ? phoneNumber
                                                    : user?.phoneNumber || ''
                                            )
                                        }}
                                    >
                                        Resend{' '}
                                        {codeTimer > 0 ? `(${codeTimer})` : ''}
                                    </button>
                                </div>
                                <button
                                    onClick={() => {
                                        updateUser({
                                            onboardingStage:
                                                OnboardingStage.NOT_STARTED,
                                        })

                                        setTimeout(() => {
                                            getUser()
                                            setStartJoin(false)
                                        }, 1000)
                                    }}
                                    className="mr-auto mt-2 text-center text-xs text-steel-blue underline hover:text-white"
                                >
                                    I made a mistake!
                                </button>
                                <button
                                    onClick={() => {
                                        if (securityCode.length === 6) {
                                            checkCode(securityCode)
                                        }
                                    }}
                                    disabled={
                                        securityCode.length < 6 || checkingCode
                                    }
                                    className="mt-4 w-full rounded-md bg-steel-blue py-2 text-center text-lg font-bold text-white transition-all duration-100 hover:scale-[101%] hover:bg-blue-900 disabled:bg-gray-500"
                                >
                                    Verify
                                </button>
                            </div>
                        </Stage>
                        {/* Onboarding done need to join them to server now*/}
                        <Stage stageName="joining" currentStage={currentStage}>
                            <div className="flex min-h-[200px] flex-col items-center justify-center p-4">
                                <ArrowPathIcon className="size-8 animate-spin text-white" />
                                <p className="mt-6 text-center text-lg font-bold text-white">
                                    Joining you to the server...
                                </p>
                            </div>
                        </Stage>
                        <Stage stageName="joined" currentStage={currentStage}>
                            <div className="flex min-h-[200px] flex-col items-center justify-center p-4">
                                {showRejoin ? (
                                    <>
                                        <TrophyIcon className="size-12 text-steel-blue" />
                                        <p className="mt-6 text-center text-lg font-bold text-white">
                                            Would you like to rejoin?
                                        </p>
                                        <button
                                            onClick={() => {
                                                setShowRejoin(false)
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
                                    </>
                                )}
                            </div>
                        </Stage>
                    </div>
                </div>
            </div>
        </MainLayout>
    )
}
