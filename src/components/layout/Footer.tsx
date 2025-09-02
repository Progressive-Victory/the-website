'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { NavItem } from './types'
import { SocialIcon } from 'react-social-icons'

const socials = [
    'https://www.twitch.tv/progressivevictory',
    'https://www.youtube.com/channel/UCRn-TsfTCP68oee03_F2eIg',
    'https://www.instagram.com/progressivevictory/',
    'https://bsky.app/profile/progressivevictory.win',
    'https://x.com/ProgressiveVic?mx=2',
]


const navitems: NavItem[] = [
    {
        name: 'About',
        href: '/about',
    },
    {
        name: 'Volunteer',
        href: '/volunteer',
    },
    {
        name: 'Events',
        href: '/events',
    },
    {
        name: 'Merch',
        href: 'https://progressivevictory.myshopify.com/',
    },
]

export function Footer() {
    return (
        <div>
            <MobileFooter />
            <DesktopFooter />
        </div>
    )
}

function MobileFooter() {
    const { data: session } = useSession()

    return (
        <div className="flex w-full justify-center bg-black-pearl-dark px-5 lg:hidden">
            <div className="flex flex-col items-center py-6">
                <div className="mb-2 flex items-center sm:mb-6">
                    <Link
                        href="https://secure.actblue.com/donate/pvwebsite"
                        className="text-l mx-px flex items-center rounded-full bg-valencia px-4 py-2 text-center font-bold text-white transition duration-200 ease-in-out hover:bg-white hover:text-valencia xxs:mx-2 xs:text-xl sm:hidden"
                    >
                        Donate
                    </Link>
                    <div className="hidden xs:flex">
                        <Image
                            src="/images/LogoFull.webp"
                            alt="progressive-victory-logo"
                            width={256}
                            height={256}
                        />
                    </div>
                    <div className="flex xs:hidden">
                        <Image
                            src="/images/LogoFull.webp"
                            alt="progressive-victory-logo"
                            width={200}
                            height={200}
                        />
                    </div>
                </div>
                <div className="flex w-[293px] items-center justify-around border-y-2 border-footer-grey py-2 xxs:w-full sm:py-4">
                    {navitems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="m-auto mx-px rounded-full px-2 py-1 text-center text-sm font-bold text-white transition duration-200 ease-in-out hover:bg-white hover:text-valencia xxs:mx-1 xxs:text-base xs:px-4 xs:py-2 xs:text-lg"
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>
                <div className="mt-4 flex w-[293px] flex-row items-center justify-between gap-x-4 border-b-2 border-footer-grey pb-4 xxs:hidden">
                    <Link
                        href="https://secure.actblue.com/donate/pvwebsite"
                        className="mr-[-14px] hidden h-[50px] items-center rounded-full bg-valencia px-4 py-2 text-center text-xl font-bold text-white transition duration-200 ease-in-out hover:bg-white hover:text-valencia sm:flex"
                    >
                        Donate
                    </Link>
                    {socials.map((social) => (
                        <SocialIcon
                            key={social}
                            url={social}
                            fgColor="white"
                            style={{ height: 44, width: 44 }}
                        />
                    ))}
                </div>
                <div className="mt-4 hidden w-full flex-row items-center justify-between gap-x-4 border-b-2 border-footer-grey pb-4 xxs:flex">
                    <Link
                        href="https://secure.actblue.com/donate/pvwebsite"
                        className="mr-[-14px] hidden h-[50px] items-center rounded-full bg-valencia px-4 py-2 text-center text-xl font-bold text-white transition duration-200 ease-in-out hover:bg-white hover:text-valencia sm:flex"
                    >
                        Donate
                    </Link>
                    {socials.map((social) => (
                        <SocialIcon key={social} url={social} fgColor="white" />
                    ))}
                </div>
                <div className="my-4 w-[293px] border-2 border-white p-1 text-center text-sm font-bold text-steel-blue xxs:w-full xs:text-lg sm:my-6">
                    PAID FOR BY PROGRESSIVE VICTORY{' '}
                    <Link
                        href="https://progressivevictory.win"
                        className="text-valencia"
                    >
                        WWW.PROGRESSIVEVICTORY.WIN
                    </Link>{' '}
                    NOT AUTHORIZED BY ANY CANDIDATE OR CANDIDATE’S COMMITTEE.
                </div>
                <div className="flex w-[293px] items-center justify-around border-y-2 border-footer-grey py-4 xxs:w-full">
                    <Link
                        className="mx-1 rounded-full px-2 py-1 text-center text-sm font-bold text-white transition duration-200 ease-in-out hover:bg-white hover:text-valencia xxs:text-base xs:px-4 xs:py-2 xs:text-lg"
                        key="Contact"
                        href="https://docs.google.com/forms/d/e/1FAIpQLSdBRKV6bbxcx6HtNALWyjAwvEXbGSIG9s7iFEFlCEImVXILHA/viewform"
                    >
                        Contact
                    </Link>
                    <Link href="/privacy">
                        <p className="mx-1 rounded-full px-2 py-1 text-center text-sm font-bold text-white transition duration-200 ease-in-out hover:bg-white hover:text-valencia xxs:text-base xs:px-4 xs:py-2 xs:text-lg">
                            Privacy Policy
                        </p>
                    </Link>
                    {session ? (
                        <button
                            onClick={() => void signOut({ callbackUrl: '/' })}
                            className="mx-1 rounded-full px-2 py-1 text-center text-sm font-bold text-white transition duration-200 ease-in-out hover:bg-white hover:text-valencia xxs:text-base xs:px-4 xs:py-2 xs:text-lg"
                        >
                            Sign Out
                        </button>
                    ) : (
                        <Link
                            href="/login"
                            className="mx-1 rounded-full px-2 py-1 text-center text-sm font-bold text-white transition duration-200 ease-in-out hover:bg-white hover:text-valencia xxs:text-base xs:px-4 xs:py-2 xs:text-lg"
                        >
                            Log In
                        </Link>
                    )}
                </div>
            </div>
        </div>
    )
}

function DesktopFooter() {
    const { data: session } = useSession()

    return (
        <div className="hidden w-full items-center justify-center bg-black-pearl-dark py-6 lg:flex">
            <div className="w-full flex-col">
                <div className="flex items-center">
                    <div className="ml-10 mr-4 flex w-full border-t-[3px] border-footer-grey pt-3 opacity-20"></div>
                    <div className="flex justify-end">
                        {navitems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="mx-6 rounded-full px-4 py-2 text-center text-lg font-bold text-white transition duration-200 ease-in-out hover:bg-white hover:text-valencia"
                            >
                                {item.name}
                            </Link>
                        ))}
                        <Link
                            href="https://secure.actblue.com/donate/pvwebsite"
                            className="mx-6 flex items-center rounded-full bg-valencia px-4 py-2 text-center text-xl font-bold text-white transition duration-200 ease-in-out hover:bg-white hover:text-valencia xl:hidden"
                        >
                            Donate
                        </Link>
                    </div>
                </div>
                <div className="my-4 flex items-center">
                    <div className="flex w-full items-center justify-start">
                        <div className="ml-10 w-[350px] border-2 border-white p-1 text-center font-bold text-steel-blue">
                            PAID FOR BY PROGRESSIVE VICTORY{' '}
                            <Link
                                href="https://progressivevictory.win"
                                className="text-valencia"
                            >
                                WWW.PROGRESSIVEVICTORY.WIN
                            </Link>{' '}
                            NOT AUTHORIZED BY ANY CANDIDATE OR CANDIDATE’S
                            COMMITTEE.
                        </div>
                    </div>
                    <div className="flex items-center">
                        <Image
                            src="/images/Logo_White.svg"
                            alt="progressive-victory-icon"
                            width={250}
                            height={250}
                        />
                    </div>
                    <div className="m-6 flex w-full justify-end">
                        <div className="flex flex-row items-center justify-center gap-x-4">
                            {socials.map((social) => (
                                <SocialIcon
                                    key={social}
                                    url={social}
                                    fgColor="white"
                                />
                            ))}
                        </div>
                        <Link
                            href="https://secure.actblue.com/donate/pvwebsite"
                            className="mx-6 hidden items-center rounded-full bg-valencia px-4 py-2 text-center text-xl font-bold text-white transition duration-200 ease-in-out hover:bg-white hover:text-valencia xl:flex"
                        >
                            Donate
                        </Link>
                    </div>
                </div>
                <div className="flex items-center">
                    <div className="ml-10 mr-8 flex w-full border-b-[3px] border-footer-grey pb-3 opacity-20"></div>
                    <div className="flex items-center justify-end">
                        <Link
                            className="mx-2 rounded-full px-4 py-2 text-center text-lg font-bold text-white transition duration-200 ease-in-out hover:bg-white hover:text-valencia"
                            key="Contact"
                            href="https://docs.google.com/forms/d/e/1FAIpQLSdBRKV6bbxcx6HtNALWyjAwvEXbGSIG9s7iFEFlCEImVXILHA/viewform"
                        >
                            Contact
                        </Link>
                        <Link href="/privacy">
                            <p className="mx-2 whitespace-nowrap rounded-full px-4 py-2 text-center text-lg font-bold text-white transition duration-200 ease-in-out hover:bg-white hover:text-valencia">
                                Privacy Policy
                            </p>
                        </Link>
                        {session ? (
                            <button
                                onClick={() =>
                                    void signOut({ callbackUrl: '/' })
                                }
                                className="ml-2 mr-6 whitespace-nowrap rounded-full px-4 py-2 text-center text-lg font-bold text-white transition duration-200 ease-in-out hover:bg-white hover:text-valencia"
                            >
                                Sign Out
                            </button>
                        ) : (
                            <Link
                                href="/login"
                                className="ml-2 mr-6 whitespace-nowrap rounded-full px-4 py-2 text-center text-lg font-bold text-white transition duration-200 ease-in-out hover:bg-white hover:text-valencia"
                            >
                                Log In
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
