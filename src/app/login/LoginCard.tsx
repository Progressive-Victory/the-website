'use client'
import { SignInAuthorizationParams, SignInOptions } from 'next-auth/react'
import Image from 'next/image'

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
    return (
        <div className="flex max-w-[30rem] flex-col items-center justify-center gap-6 rounded-md bg-black-pearl-dark p-8 text-center shadow-lg">
            <h1 className="text-2xl font-bold text-white">
                Log In to Continue
            </h1>
            <p className="text-sm font-medium text-white">
                Click the button below to log in. If you haven&apos;t completed the
                onboarding form yet, you&apos;ll be prompted to do that before you
                can join the server.
                <br />
                <br />
                <strong className="text-red-500">
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
