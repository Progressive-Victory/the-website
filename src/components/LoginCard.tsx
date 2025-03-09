'use client'
import Image from 'next/image'
import { SignInOptions } from 'next-auth/react'
export function LoginCard({
    signIn,
    redirect,
}: {
    signIn: (provider: string, options?: SignInOptions) => void
    redirect: string
}) {
    return (
        <div className="flex flex-col items-center justify-center bg-black-pearl-dark p-4 rounded-md shadow-lg">
            <h1 className="text-2xl font-bold text-white text-center">
                Log In to Continue
            </h1>
            <button
                onClick={() => signIn('discord', { callbackUrl: redirect })}
                className="flex flex-row items-center justify-center gap-x-4 mt-6 bg-[#5865F2] text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out"
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
