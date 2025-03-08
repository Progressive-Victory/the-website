'use client'
import { MainLayout } from '@/components/MainLayout'
import { ChangeEvent, ReactElement, useEffect, useState } from 'react'
import { InformationCircleIcon } from '@heroicons/react/24/solid'
import { useSession } from 'next-auth/react'
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
            className={`flex flex-col items-start justify-center my-2 transition-all duration-200 ${
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
    const [validationFlags, setValidationFlags] = useState<
        Map<string, boolean>
    >(new Map())
    const [codeTimer, setCodeTimer] = useState<number>(0)
    const { data: session, status } = useSession()

    useEffect(() => {
        const requestCode = async (phone: string) => {
            const resp = await fetch('/api/verify/send', {
                method: 'POST',
                body: JSON.stringify({
                    number: phone,
                }),
            })

            if (resp.status === 200) {
                setCodeTimer(60) // Start a one minute clock
                let countdown = setInterval(() => {
                    if (codeTimer === 0) {
                        clearInterval(countdown)
                    } else {
                        setCodeTimer((prev) => prev - 1)
                    }
                }, 1000)
            }
        }

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
                setShowVerify(true) // Start OTP verification via SMS
                requestCode(phoneNumber)
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
                        ) : status !== 'authenticated' ? (
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
                        {showVerify && status === 'authenticated' ? (
                            <>
                                <p className="text-lg text-white font-white text-center font-bold">
                                    Enter your Verification Code
                                </p>
                                <p className="text-white text-center text-lg mx-2 font-medium mx-auto mb-2">
                                    We just sent it to your phone 📱
                                </p>
                                <Field
                                    value={securityCode}
                                    placeholder="Security Code"
                                    error={true}
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
                                    className={`${
                                        codeTimer > 0
                                            ? 'text-steel-blue'
                                            : 'text-gray-500'
                                    } underline w-fit p-2 text-left`}
                                >
                                    Resend{' '}
                                    {codeTimer > 0 ? `(${codeTimer})` : ''}
                                </button>
                            </>
                        ) : null}
                    </div>
                </div>
            </div>
        </MainLayout>
    )
}
