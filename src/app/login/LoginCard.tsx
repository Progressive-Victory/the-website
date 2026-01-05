'use client'

import { SignInAuthorizationParams, SignInOptions } from 'next-auth/react'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export function LoginCard({
    signIn,
    redirect,
}: {
    signIn: (
        provider: string,
        options?: SignInOptions,
        params?: SignInAuthorizationParams
    ) => void
    redirect: string
}) {
    function get_error_message(code: string | null) {
        if (!code) return null

        switch (code) {
            case 'DiscordEmailNotVerified':
                return 'Your Discord email is not verified! Please go verify it and then try again.'
            case 'OAuthCallbackError':
                return 'Failed to login with Discord. Please try again later.'
            default:
                return 'An unknown error occurred. Please try again later.'
        }
    }

    const params = useSearchParams()
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    useEffect(() => {
        setErrorMessage(get_error_message(params.get('error')))
    }, [params])

    return (
        <div className="flex max-w-[30rem] flex-col items-center justify-center gap-6 rounded-md bg-black-pearl-dark p-8 text-center shadow-lg">
            <h1 className="text-2xl font-bold text-white">
                Log In to Continue
            </h1>
            {errorMessage && (
                <p className="rounded-md border-2 border-red-600 p-2 font-bold text-red-500">
                    ERROR: {errorMessage}
                </p>
            )}
            <p className="text-sm font-medium text-white">
                Click the button below to log in. If you haven&apos;t completed
                the onboarding form yet, you&apos;ll be prompted to do that
                before you can join the server.
                <br />
                <br />
                <strong className="text-yellow-300">
                    NOTE: Your Discord account MUST have a verified email
                </strong>
            </p>
            <button
                onClick={() =>
                    signIn(
                        'discord',
                        { callbackUrl: redirect },
                        { prompt: 'none' }
                    )
                }
                className="mb-0.5 flex w-full flex-row items-center justify-center gap-x-4 rounded-lg bg-[#5865F2] px-4 py-2 font-bold text-white transition duration-300 ease-in-out"
            >
                <Image
                    src="/images/discord-white-icon.png"
                    alt="discord-logo"
                    width={32}
                    height={32}
                />
                Sign In with Discord
            </button>
        </div>
    )
}
