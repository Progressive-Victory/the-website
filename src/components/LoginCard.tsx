'use client'
import Image from 'next/image'
import { SignInAuthorizationParams, SignInOptions } from 'next-auth/react'
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
        <div className="flex flex-col items-center justify-center rounded-md bg-black-pearl-dark p-4 shadow-lg">
            <h1 className="text-center text-2xl font-bold text-white">
                Log In to Continue
            </h1>
            <button
                onClick={() =>
                    { signIn(
                        'discord',
                        { callbackUrl: redirect },
                        { prompt: 'none' }
                    ); }
                }
                className="mt-6 flex flex-row items-center justify-center gap-x-4 rounded-lg bg-[#5865F2] px-4 py-2 font-bold text-white transition duration-300 ease-in-out"
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
