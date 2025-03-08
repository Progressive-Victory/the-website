'use client'
import { MainLayout } from '@/components/MainLayout'
import {
    ChangeEvent,
    ReactElement,
    useEffect,
    useState,
    Dispatch,
    SetStateAction,
} from 'react'
import { ArrowPathIcon, InformationCircleIcon } from '@heroicons/react/24/solid'
import { useSession } from 'next-auth/react'
import { IUser } from '@/models/User'
import { OnboardingStage } from '@/util/stage'
import Link from 'next/link'
function Field({
    value, // Value
    onChange, // Value setter
    placeholder, // Label and placeholder text
    disabled,
    error,
    errorText,
    required = true,
    maxLength,
}: {
    value: string
    onChange: (e: ChangeEvent<HTMLInputElement>) => void
    placeholder?: string
    disabled?: boolean
    error?: boolean
    errorText?: string
    required?: boolean
    maxLength?: number
}) {
    return (
        <div
            className={`flex flex-col items-start justify-center my-2 transition-all duration-200 w-full ${
                disabled !== null && disabled
                    ? 'h-0 opacity-0 -mb-2'
                    : 'h-[48px]'
            }`}
        >
            <label className="inline-block text-gray-300 text-sm">
                {placeholder}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
                value={value}
                maxLength={maxLength !== null ? maxLength : 25}
                disabled={disabled !== null && disabled}
                placeholder={placeholder ? placeholder : ''}
                onChange={(e) => {
                    if (disabled !== null && !disabled) {
                        onChange(e)
                    }
                }}
                className={`bg-white rounded-md w-full px-4 py-2 ring-steel-blue ${
                    error !== null && value !== '' && !error
                        ? 'border-red-500 border-2'
                        : ''
                }`}
            />
            {!error && value !== '' && (
                <div className="text-left h-4 text-red-500 text-xs my-1">
                    {errorText}
                </div>
            )}
        </div>
    )
}

function Toggle({
    value, // Value
    onChange, // Value setter
    placeholder, // Label and placeholder text
    tooltip,
}: {
    value: boolean
    onChange: () => void
    placeholder?: string | ReactElement
    tooltip?: string
}) {
    return (
        <div className="flex flex-row items-center justify-between bg-gray-700 p-2 rounded-md">
            <div className="flex flex-row items-center">
                <div
                    tabIndex={0}
                    className="group relative touch-pan-zoom cursor-pointer"
                >
                    <InformationCircleIcon className="w-4 h-4 mr-2 text-steel-blue bg-white rounded-full" />
                    <div className="absolute z-10 top-0 opacity-0 group-hover:opacity-75 group-focus:opacity-75 group-hover:translate-y-[25px] group-focus:translate-y-[25px] transition-all duration-100 flex pointer-events-none flex-col items-center bg-black rounded-md py-2 px-px text-center text-gray-700 text-sm">
                        <span className="min-w-[300px] text-xs text-white text-center">
                            {tooltip}
                        </span>
                    </div>
                </div>

                <label className="text-white text-xs lg:text-sm">
                    {placeholder}
                </label>
            </div>

            <div
                className="relative inline-block w-12 ml-auto lg:ml-0 lg:mr-2 align-middle select-none"
                onClick={() => {
                    onChange()
                }}
            >
                <label
                    className={`${
                        value ? 'bg-steel-blue' : 'bg-gray-500'
                    } block overflow-hidden h-6 rounded-full cursor-pointer transition-all duration-300`}
                    htmlFor="toggle"
                >
                    <span
                        className={`${
                            value
                                ? 'translate-x-6 bg-white shadow-lg'
                                : 'translate-x-0 bg-white'
                        } absolute block w-6 h-6 rounded-full transition-all duration-300`}
                    />
                </label>
            </div>
        </div>
    )
}

export default function Volunteer() {
    const [preferredName, setPreferredName] = useState<string>('')
    const [phoneNumber, setPhoneNumber] = useState<string>('')
    const [zipCode, setZipCode] = useState<string>('')
    const [fromUS, setFromUS] = useState<boolean>(false)
    const [getAlerts, setGetAlerts] = useState<boolean>(false)
    const [privacyPolicy, setPrivacyPolicy] = useState<boolean>(false)
    const [startJoin, setStartJoin] = useState<boolean>(false)
    const [securityCode, setSecurityCode] = useState<string>('')
    const [showVerify, setShowVerify] = useState<boolean>(false)
    const [codeError, setCodeError] = useState<boolean>(false)
    const [validationFlags, setValidationFlags] = useState<
        Map<string, boolean>
    >(new Map())
    const [codeTimer, setCodeTimer] = useState<number>(0)
    const [user, setUser] = useState<Partial<IUser> | undefined>()
    const { data: session, status } = useSession()

    const requestCode = async (
        phone: string,
        setter: Dispatch<SetStateAction<number>>,
        timer: number
    ) => {
        const resp = await fetch('/api/verify/send', {
            method: 'POST',
            body: JSON.stringify({
                number: phone,
            }),
        })

        console.log(resp)
        if (resp.status === 200) {
            setter(60) // Start a one minute clock
            let countdown = setInterval(() => {
                if (timer === -1) {
                    setter(0)
                    clearInterval(countdown)
                } else {
                    setter((prev) => prev - 1)
                }
            }, 1000)
            return true
        } else {
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
        const getUser = async () => {
            const response = await fetch('/api/user')
            const data = await response.json()
            setUser(data as Partial<IUser>)
        }
        getUser()
    }, [])

    useEffect(() => {
        if (user?.onboardingStage === OnboardingStage.AWAIT_VERIFICATION) {
            setShowVerify(true)
        }
    }, [user])

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
                        requestCode(phoneNumber, setCodeTimer, codeTimer).then(
                            (result) => {
                                if (result) {
                                    setShowVerify(true) // Start OTP verification via SMS
                                } else {
                                    //TODO: An error occured do something
                                    console.error('Could not send OTP!')
                                }
                            }
                        )
                    } else {
                        // TODO: an error occured in setting user data
                        console.error('Could not update user profile!')
                    }
                })
            }
        }
    }, [startJoin, validationFlags, phoneNumber, privacyPolicy])

    return (
        <MainLayout>
            <div className="relative flex flex-col items-center h-screen justify-center bg-steel-blue">
                <div className="absolute top-0 left-0 w-full h-full halftone opacity-10 z-1" />
                <div
                    className="absolute top-0 right-0 lg:translate-x-1/2 w-full lg:w-1/2 h-full"
                    style={{
                        backgroundImage: "url('/images/blend_test.png')",
                        backgroundSize: 'cover',
                        backgroundPosition: 'right',
                        mixBlendMode: 'lighten',
                        transform: 'scaleX(-1)',
                    }}
                />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col w-full max-w-[600px] mx-auto z-2">
                    <div className="relative flex flex-col rounded-lg bg-black-pearl-dark p-4 shadow-md gap-y-4">
                        {/* Chunky stuff for form filling */}
                        {!showVerify && status === 'authenticated' ? (
                            <>
                                <p className="text-white text-center text-3xl font-bold my-2 mx-auto">
                                    Volunteer with PV
                                </p>
                                <p className="text-white text-center text-lg mx-2 font-medium mx-auto mb-2">
                                    Join us on Discord and make a difference ✨
                                </p>
                                <Field
                                    value={preferredName}
                                    placeholder="Preferred Name"
                                    error={validationFlags.get('name')}
                                    errorText="Enter a valid name with no special characters"
                                    maxLength={40} // sensible default, may be too premissive
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
                                <p className={`"text-xs text-white -mt-2`}>
                                    US numbers only. Message and data rates may
                                    apply.
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
                                />
                                <div className="text-left text-xs w-full text-white px-1">
                                    <span className="text-red-500">*</span> =
                                    required field
                                </div>
                                <button
                                    onClick={() => {
                                        setStartJoin(true)
                                    }}
                                    disabled={startJoin}
                                    className="bg-steel-blue rounded-md w-full mt-4 py-2 text-lg font-bold hover:bg-blue-900 hover:scale-[101%] text-white transition-all duration-100"
                                >
                                    Join Now
                                </button>
                            </>
                        ) : status === 'unauthenticated' ? (
                            <>
                                <p className="text-white text-center text-3xl font-bold my-2 mx-auto">
                                    Volunteer with PV
                                </p>
                                <p className="text-white text-center text-lg mx-2 font-medium mx-auto mb-2">
                                    Join us on Discord and make a difference ✨
                                </p>
                                <p className="text-white text-center text-lg mx-2 font-medium mx-auto mb-2">
                                    But first you{"'"}ve got to log in...
                                </p>
                                <Link
                                    href="/login?redirect=/volunteer"
                                    className="bg-steel-blue rounded-md text-center w-full mt-4 py-2 text-lg font-bold hover:bg-blue-900 hover:scale-[101%] text-white transition-all duration-100"
                                >
                                    Goto Log In
                                </Link>
                            </>
                        ) : null}
                        {/* Loading indicator for between auth state */}
                        {status === 'loading' && (
                            <div className="flex flex-col items-center justify-center p-4 min-h-[200px]">
                                <ArrowPathIcon className="h-8 w-8 text-white animate-spin" />
                                <p className="text-lg font-bold text-center text-white mt-6">
                                    Loading...
                                </p>
                            </div>
                        )}
                        {/* Phone verification state */}
                        {showVerify && status === 'authenticated' ? (
                            <div className="flex flex-col items-center w-full">
                                <p className="text-lg text-white font-white text-center font-bold">
                                    Enter your Verification Code
                                </p>
                                <p className="text-white text-center text-lg mx-2 font-medium mx-auto mb-2">
                                    We just sent it to your phone 📱
                                </p>
                                <Field
                                    value={securityCode}
                                    placeholder="Security Code"
                                    error={!codeError}
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
                                            ? 'text-steel-blue'
                                            : 'text-gray-500'
                                    } underline w-fit mr-auto p-2 text-left`}
                                    onClick={() => {
                                        // Get a new OTP
                                        requestCode(
                                            phoneNumber,
                                            setCodeTimer,
                                            codeTimer
                                        )
                                    }}
                                >
                                    Resend{' '}
                                    {codeTimer > 0 ? `(${codeTimer})` : ''}
                                </button>
                                <button className="bg-steel-blue rounded-md text-center w-full mt-4 py-2 text-lg font-bold hover:bg-blue-900 hover:scale-[101%] text-white transition-all duration-100">
                                    Verify
                                </button>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </MainLayout>
    )
}
