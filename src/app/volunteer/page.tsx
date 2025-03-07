'use client'
import { MainLayout } from '@/components/MainLayout'
import { ChangeEvent, ReactElement, useState } from 'react'
import { InformationCircleIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'
function Field({
    value, // Value
    onChange, // Value setter
    placeholder, // Label and placeholder text
    disabled,
    required = true,
}: {
    value: string
    onChange: (e: ChangeEvent<HTMLInputElement>) => void
    placeholder?: string
    disabled?: boolean
    required?: boolean
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
                disabled={disabled !== null && disabled}
                placeholder={placeholder ? placeholder : ''}
                onChange={(e) => {
                    if (disabled !== null && !disabled) {
                        onChange(e)
                    }
                }}
                className="bg-white rounded-md w-full px-4 py-2"
            />
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
        <div className="flex flex-row items-center justify-between my-2 bg-gray-700  p-2 rounded-md">
            <div className="flex flex-row items-center">
                <label className="text-white text-sm">{placeholder}</label>
                <div className="group relative touch-pan-zoom cursor-pointer">
                    <InformationCircleIcon className="w-4 h-4 ml-2 text-blue-500 bg-white rounded-full"></InformationCircleIcon>
                    <div className="absolute z-10 top-0 opacity-0 group-hover:opacity-75 group-hover:translate-y-[25px] transition-all duration-100 flex pointer-events-none flex-col items-center bg-black rounded-md py-2 px-px text-center text-gray-700 text-sm">
                        <span className="min-w-[300px] text-xs text-white text-center">
                            {tooltip}
                        </span>
                    </div>
                </div>
            </div>

            <div
                className="relative inline-block w-12 mr-2 align-middle select-none"
                onClick={() => {
                    onChange()
                }}
            >
                <label
                    className={`${
                        value ? 'bg-blue-500' : 'bg-gray-500'
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
    const [validationFlags, setValidationFlags] = useState<
        Map<string, boolean>
    >(new Map())

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
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col min-w-[600px] mx-auto z-2">
                    <div className="flex flex-col rounded-lg bg-black-pearl-dark p-4 shadow-md">
                        <p className="text-white text-3xl font-bold my-2 mx-auto">
                            Volunteer with PV
                        </p>
                        <p className="text-white text-lg font-medium mx-auto">
                            Make a difference ✨
                        </p>
                        <Field
                            value={preferredName}
                            placeholder="Preferred Name"
                            onChange={(e) => {
                                const text = e.target.value
                                setPreferredName(text)
                                const isValid = /^[A-Za-z. \s_-]*$/g.test(text)
                                setValidationFlags((prev) =>
                                    new Map(prev).set('name', isValid)
                                )
                            }}
                        />
                        <Field
                            value={phoneNumber}
                            placeholder="Phone Number"
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
                        <p className="text-xs text-white mb-2">
                            US numbers only. Message and data rates may apply.
                        </p>
                        <Field
                            value={zipCode}
                            placeholder="Zip Code"
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
                            placeholder={
                                <span>
                                    <span className="text-red-500">*</span> I
                                    agree to the{' '}
                                    <Link
                                        href="/privacy"
                                        target="_blank"
                                        referrerPolicy="no-referrer"
                                        className="text-blue-500 underline"
                                    >
                                        Privacy Policy
                                    </Link>
                                </span>
                            }
                            tooltip="You are agreeing to the usage of your data as described by the policy"
                            onChange={() => {
                                setGetAlerts(!getAlerts)
                            }}
                        />
                    </div>
                </div>
            </div>
        </MainLayout>
    )
}
