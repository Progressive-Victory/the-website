'use client'
import { MainLayout } from '@/components/MainLayout'
import { signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { IUser } from '@/models/User'
export default function Account() {
    const [user, setUser] = useState<IUser | undefined>();
    useEffect(() => {
        const getUser = async () => {
            const userRequest = (await fetch("/api/user"))
            const user = await userRequest.json()
            setUser(user);
        }

        getUser();
    }, [])

    if (!user) {
        return null;
    } else {
        return (
            <MainLayout>
                <div> Welcome, {user.display_name} </div>
                <div className="bg-steel-blue w-full h-screen">
                    <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="bg-valencia text-white font-bold py-2 px-4 rounded-full hover:bg-white hover:text-black transition duration-300 ease-in-out"
                    >
                        Sign Out
                    </button>
                </div>
            </MainLayout>
        )

    }
}