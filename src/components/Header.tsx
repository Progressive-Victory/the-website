'use client'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'
import Image from 'next/image'
import { Transition } from '@headlessui/react'
import { useState } from 'react'
import { motion } from 'motion/react'
import { useSession } from 'next-auth/react'

const navitems = [
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
    {
        name: 'Contact',
        href: 'https://docs.google.com/forms/d/e/1FAIpQLSdBRKV6bbxcx6HtNALWyjAwvEXbGSIG9s7iFEFlCEImVXILHA/viewform',
    },
]

/**
 * A navigation header for the Progressive Victory website.
 *
 * This component renders a sticky header bar with the Progressive Victory
 * logo on the left and a navigation menu on the right. The navigation menu
 * includes links to the main pages of the website, as well as a "Donate" button.
 * On large screens, the menu is shown as a horizontal list of links. On small
 * screens, the menu is hidden and replaced with a hamburger menu icon that
 * toggles the display of the menu when clicked. When the menu is displayed on
 * small screens, it is rendered as a vertical list of links that covers the
 * entire screen.
 *
 * @return {JSX.Element} The rendered header component.
 */
export function Header() {
    const [isOpen, setIsOpen] = useState(false)
    const { data: session } = useSession()

    return (
        <>
            <div className="sticky top-0 left-0 right-0 flex flex-row items-center justify-between w-full gap-x-4 px-6 md:px-12 py-4 z-50 bg-black-pearl-dark h-[100px]">
                <Link href="/">
                    <div className="flex-none">
                        <Image
                            src="/images/LogoFull.webp"
                            alt="progressive-victory-logo"
                            width={256}
                            height={256}
                        />
                    </div>
                </Link>
                <div className="flex flex-row items-center justify-center gap-x-12 cursor-pointer w-full hidden xl:flex">
                    {navitems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            target={item.href.includes('https') ? '_blank' : ''}
                            referrerPolicy={'no-referrer'}
                            className="text-xl text-white font-bold hover:text-valencia hover:bg-white rounded-full px-3 py-1 transition duration-200 ease-in-out"
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>
                <div className="flex flex-row items-center justify-center gap-x-4 w-[300px]">
                    <Link
                        href="https://secure.actblue.com/donate/pvwebsite"
                        target="_blank"
                        className="text-xl bg-valencia px-4 py-2 rounded-full text-white font-bold hover:bg-white hover:text-black-pearl-dark transition duration-300 ease-in-out hidden xl:block"
                    >
                        Donate
                    </Link>
                    {!session ? (
                        <Link
                            href="/login"
                            className="text-xl whitespace-nowrap bg-steel-blue px-4 py-2 rounded-full text-white font-bold hover:bg-white hover:text-black-pearl-dark transition duration-300 ease-in-out hidden xl:block"
                        >
                            Log In
                        </Link>
                    ) : (
                        <Link
                            href="/account"
                            className="bg-white p-1 rounded-full text-white group hover:scale-105 hover:bg-valencia hover:text-black-pearl-dark transition duration-300 ease-in-out hidden xl:block"
                        >
                            <Image
                                src={session.user!.image || ''}
                                className="rounded-full transition duration-300 ease-in-out"
                                alt="User Image"
                                width={44}
                                height={44}
                            />
                        </Link>
                    )}
                </div>

                <button
                    className="group xl:hidden"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? (
                        <XMarkIcon className="w-8 h-8 text-white group-hover:text-valencia transition duration-300 ease-in-out" />
                    ) : (
                        <Bars3Icon className="w-8 h-8 text-white group-hover:text-valencia transition duration-300 ease-in-out" />
                    )}
                </button>
                <Transition
                    show={isOpen}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                >
                    <div className="absolute top-24 left-0 right-0 flex flex-col items-center justify-center w-full px-4 py-4 gap-y-4 z-10 bg-black-pearl-dark overflow-hidden xl:hidden">
                        {navitems.map((item, index) => (
                            <Link
                                href={item.href}
                                key={item.name}
                                target={
                                    item.href.includes('https') ? '_blank' : ''
                                }
                                referrerPolicy={'no-referrer'}
                                className="w-full"
                            >
                                <motion.div
                                    layoutId={item.name}
                                    initial={{ x: '-100vw', opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{
                                        duration: 0.1,
                                        ease: 'easeIn',
                                        delay: index * 0.05,
                                    }}
                                    className="cursor-pointer text-center text-xl text-white font-bold hover:text-valencia hover:bg-white rounded-full w-full px-2 py-4 transition duration-200 ease-in-out"
                                >
                                    {item.name}
                                </motion.div>
                            </Link>
                        ))}
                        <Link
                            href="https://secure.actblue.com/donate/pvwebsite"
                            target="_blank"
                            className="w-full"
                        >
                            <motion.div
                                initial={{ x: '-100vw', opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{
                                    duration: 0.2,
                                    ease: 'easeIn',
                                }}
                                className="cursor-pointer rounded-full text-center text-xl text-white bg-valencia hover:bg-white hover:text-black-pearl-dark font-bold w-full px-2 py-4"
                            >
                                Donate
                            </motion.div>
                        </Link>
                        {!session ? (
                            <Link href="/login" className="w-full">
                                <motion.div
                                    initial={{ x: '-100vw', opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{
                                        duration: 0.2,
                                        ease: 'easeIn',
                                    }}
                                    className="cursor-pointer rounded-full text-center text-xl text-white bg-steel-blue hover:bg-white hover:text-black-pearl-dark font-bold w-full px-2 py-4"
                                >
                                    Log In
                                </motion.div>
                            </Link>
                        ) : (
                            <Link href="/account" className="w-full">
                                <div className="flex flex-row rounded-full items-center justify-center gap-x-4 cursor-pointer text-center text-xl text-white bg-steel-blue hover:bg-white hover:text-black-pearl-dark font-bold w-full px-2 py-2">
                                    <Image
                                        src={session.user!.image || ''}
                                        width={44}
                                        height={44}
                                        className="rounded-full border-2 border-white"
                                        alt="User Image"
                                    />
                                    Account
                                </div>
                            </Link>
                        )}
                    </div>
                </Transition>
            </div>
        </>
    )
}
