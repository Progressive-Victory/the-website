'use client'
import Link from 'next/link'
import { MainLayout } from '@/components/MainLayout'
import { LoginCard } from '@/components/LoginCard'

import { useSession, signIn, signOut } from 'next-auth/react'
export default function Home() {
    const { data: session } = useSession()

    return (
        <MainLayout>
            <div className="flex flex-col items-center justify-center bg-steel-blue w-full h-screen">
                <LoginCard signIn={signIn} signOut={signOut} />
                {session ? (
                    <div>Logged in as {session.user?.email}</div>
                ) : (
                    <div>Not logged in</div>
                )}
            </div>
        </MainLayout>
    )
}

export function DiscordButton() {
    const ID = process.env.OAUTH_DISCORD_APPID!
    // const secret = process.env.OAUTH_DISCORD_CLIENT_SECRET!
    const host = process.env.HOST!
    // const discordauthpath:string  = `https://discord.com/oauth2/authorize?client_id=${ ID }&response_type=code&redirect_uri=http%3A%2F%2F${ ip }%3A3000%2Foauth%2Fdiscord%2F&scope=identify+email`
    // const redirect_uri
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                width: '130%',
                height: '30%',
            }}
        >
            <Link
                href={{
                    pathname: 'https://discord.com/oauth2/authorize',
                    query: {
                        client_id: ID,
                        response_type: 'code',
                        redirect_uri: `http://${host}/oauth/discord/`,
                        scope: 'identify',
                    },
                }}
            ></Link>
        </div>
    )
}
