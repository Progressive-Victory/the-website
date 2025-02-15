'use client'

import Image from 'next/image'
export function LoginCard({
    signIn,
    signOut,
}: {
    signIn: (provider: string) => void
    signOut: () => void
}) {
    return (
        <div className="flex flex-col items-center justify-center bg-white p-4 rounded-md shadow-lg">
            <h1 className="text-2xl font-bold text-black text-center">
                Log In to Continue
            </h1>
            <button
                onClick={() => signIn('discord')}
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
