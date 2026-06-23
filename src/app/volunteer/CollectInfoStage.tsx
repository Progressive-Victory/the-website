import { Field, SupportNote, Toggle } from '.'
import { dateService } from '@/services'
import { useFetch, useInit } from '@/util/hooks'
import Link from 'next/link'
import phone from 'phone'
import { Country, isValidCountryPostalCode } from 'postal-code-validator'
import { Location, zLocation } from 'pv-contracts/data'
import { useCallback, useEffect, useMemo, useState } from 'react'

export interface IOnboardingForm {
    firstName: string
    lastName: string
    dateOfBirth: string
    zipCode: string
    phoneNumber: string

    getAlerts: boolean
    usCitizen: boolean
    privacyPolicy: boolean
    oneTimePasscode: boolean
}

export interface CollectInfoStageProps {
    initialForm: IOnboardingForm
    isPending: boolean
    onSubmit: (form: IOnboardingForm) => void
}

export function CollectInfoStage({
    initialForm,
    isPending,
    onSubmit,
}: CollectInfoStageProps) {
    const { onGet } = useFetch()

    const [form, setForm] = useState(initialForm)
    const [phoneNumber, setPhoneNumber] = useState('')

    const validName = (name: string) =>
        /^[A-Za-z. \s_-]*$/g.test(name) && name.trim() !== ''
    const firstNameIsValid = validName(form.firstName)
    const lastNameIsValid = validName(form.lastName)

    const age = dateService.getAge(new Date(form.dateOfBirth))
    const dateOfBirthIsValid = age != null

    const zipCodeIsValid = isValidCountryPostalCode(
        form.zipCode,
        Country.UnitedStatesOfAmerica
    )
    const [zipCodeError, setZipCodeError] = useState(false)

    const parsePhone = (number: string) =>
        phone(number, {
            country: 'US',
            strictDetection: true,
            validateMobilePrefix: true,
        })
    const parsedPhone = useMemo(() => parsePhone(phoneNumber), [phoneNumber])

    const setFormattedPhoneNumber = (number: string) => {
        const { phoneNumber, isValid } = parsePhone(number)
        const formatted = isValid
            ? `(${phoneNumber.substring(2, 5)}) ${phoneNumber.substring(5, 8)}-${phoneNumber.substring(8, 12)}`
            : number
        setPhoneNumber(formatted)
    }

    const checkZip = useCallback(
        async (code: string): Promise<boolean> => {
            try {
                await onGet<Location>(`/locations/${code}`, zLocation)
                return true
            } catch {
                return false
            }
        },
        [onGet]
    )

    const handleSubmit = async (): Promise<void> => {
        const isValidZip = await checkZip(form.zipCode)
        setZipCodeError(!isValidZip)
        if (!isValidZip) return
        onSubmit(form)
    }

    const isValid =
        firstNameIsValid &&
        lastNameIsValid &&
        dateOfBirthIsValid &&
        zipCodeIsValid &&
        parsedPhone.isValid &&
        form.usCitizen &&
        form.privacyPolicy &&
        form.oneTimePasscode

    useInit(() => setFormattedPhoneNumber(initialForm.phoneNumber))

    useEffect(() => {
        if (parsedPhone.isValid)
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setForm((f) => ({
                // 6/23/26 - Not worth addressing
                ...f,
                phoneNumber: parsedPhone.phoneNumber.substring(2),
            }))
    }, [parsedPhone])

    return (
        <div>
            <header>
                <p className="mx-auto text-center text-3xl font-bold text-white">
                    Volunteer with PV
                </p>
                <p className="mx-2 mb-2 text-center text-lg font-medium text-white">
                    Join us on Discord and make a difference ✨
                </p>
            </header>
            <section className="flex flex-col gap-2">
                <section className="flex flex-col gap-2 sm:flex-row">
                    <Field
                        value={form.firstName}
                        placeholder="First Name"
                        error={!firstNameIsValid}
                        errorText="Enter a valid name with no special characters"
                        maxLength={40}
                        onChange={(e) =>
                            setForm({ ...form, firstName: e.target.value })
                        }
                    />
                    <Field
                        value={form.lastName}
                        placeholder="Last Name"
                        error={!lastNameIsValid}
                        errorText="Enter a valid name with no special characters"
                        maxLength={40}
                        onChange={(e) =>
                            setForm({ ...form, lastName: e.target.value })
                        }
                    />
                </section>
                <section className="flex flex-col gap-2 sm:flex-row">
                    <Field
                        type="date"
                        value={form.dateOfBirth}
                        placeholder="Date of Birth"
                        error={!dateOfBirthIsValid}
                        errorText="Enter a valid date of birth"
                        maxLength={10}
                        onInput={(e) =>
                            setForm({
                                ...form,
                                dateOfBirth: e.currentTarget.value,
                            })
                        }
                    />
                    <Field
                        value={form.zipCode}
                        placeholder="Zip Code"
                        error={!zipCodeIsValid}
                        errorText="Enter a valid zip code"
                        maxLength={10}
                        onChange={(e) =>
                            setForm({ ...form, zipCode: e.target.value })
                        }
                    />
                </section>
                <Field
                    value={phoneNumber}
                    placeholder="Phone Number"
                    error={!parsedPhone.isValid}
                    errorText="Enter a valid 10-digit phone number"
                    maxLength={20}
                    onChange={(e) => {
                        setPhoneNumber(e.target.value)
                    }}
                    onBlur={(e) => setFormattedPhoneNumber(e.target.value)}
                />
                <p
                    className={`-mt-0.5 mb-1 max-w-[800px] whitespace-normal break-words text-[12px] text-gray-300`}
                >
                    <em>
                        US numbers only. Message and data rates may apply. Must
                        be SMS reachable. For assistance, reply HELP to the
                        number from which you received the message, or contact
                        us at the email below. To stop receiving messages, reply
                        STOP at any time. Carriers are not liable for delayed or
                        undelivered messages
                    </em>
                </p>
            </section>
            <section className="flex flex-col gap-2">
                <Toggle
                    name="subscribe-alerts"
                    value={form.getAlerts}
                    placeholder="I want to receive community updates"
                    tooltip="Alerts may be delivered to your phone and/or email periodically. Text STOP to opt-out."
                    onChange={() => {
                        setForm({ ...form, getAlerts: !form.getAlerts })
                    }}
                />
                <Toggle
                    name="us-citizen"
                    value={form.usCitizen}
                    placeholder={
                        <span>
                            <span className="text-red-500">*</span> I swear that
                            I am a resident (or citizen living abroad) of the
                            United States of America
                        </span>
                    }
                    tooltip="Only US residents or citizens may participate in Progressive Victory"
                    onChange={() => {
                        setForm({ ...form, usCitizen: !form.usCitizen })
                    }}
                    required
                />
                <Toggle
                    name="accept-privacy"
                    value={form.privacyPolicy}
                    placeholder={
                        <span>
                            <span className="text-red-500">*</span> I agree to
                            the{' '}
                            <Link
                                href="/privacy"
                                target="_blank"
                                referrerPolicy="no-referrer"
                                className="text-steel-blue underline"
                            >
                                Terms and Conditions & Privacy Policy
                            </Link>
                        </span>
                    }
                    tooltip="You are agreeing to the usage of your data as described by the policy"
                    onChange={() => {
                        setForm({ ...form, privacyPolicy: !form.privacyPolicy })
                    }}
                    required
                />
                <Toggle
                    name="accept-otp"
                    value={form.oneTimePasscode}
                    placeholder={
                        <span>
                            <span className="text-red-500">*</span>I agree to
                            provide Progressive Victory my mobile number to
                            obtain a one-time text message for account
                            verification.
                        </span>
                    }
                    tooltip="You are agreeing to recieve a one-time message via SMS"
                    onChange={() => {
                        setForm({
                            ...form,
                            oneTimePasscode: !form.oneTimePasscode,
                        })
                    }}
                    required
                />
            </section>
            <div className="w-full px-1 text-left text-xs text-white">
                <span className="text-red-500">*</span> = required field
            </div>
            <button
                type="submit"
                onClick={() => {
                    void handleSubmit()
                }}
                disabled={!isValid || isPending}
                className="w-full rounded-md bg-steel-blue py-2 text-lg font-bold text-white transition-all duration-100 hover:bg-valencia disabled:cursor-not-allowed disabled:bg-gray-500 [&:not(:disabled)]:hover:scale-[103%]"
            >
                Join Now
            </button>
            <SupportNote />
            {zipCodeError ? (
                <p className="text-red-600">
                    The zip code entered is invalid. Please enter a real zip
                    code.
                </p>
            ) : (
                <></>
            )}
        </div>
    )
}
