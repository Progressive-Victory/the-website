'use client'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'
import Image from 'next/image'
import { Transition, TransitionChild } from '@headlessui/react'
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

const containerVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.075, // delay between children animations
        },
    },
}

const springTransition = {
    ease: 'easeInOut',
    type: 'spring',
    duration: 0.075,
    stiffness: 250,
    damping: 25,
}

const itemVariants = {
    hidden: { y: '-100vh' },
    visible: { y: 0 },
}

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
 */
export function Header() {
    const [isOpen, setIsOpen] = useState(false)
    const { data: session } = useSession()

    return (
        <>
            <div className="sticky inset-x-0 top-0 z-20 flex h-[100px] w-full flex-row items-center justify-between gap-x-4 bg-black-pearl-dark px-6 py-4 md:px-12">
                <Link href="/">
                    <div className="flex-none">
                        <Image
                            src="/images/LogoFull.webp"
                            alt="progressive-victory-logo"
                            width={256}
                            height={78}
                        />
                    </div>
                </Link>
                <div className="mb-2 flex hidden w-full cursor-pointer flex-row items-center justify-center gap-x-12 xl:flex">
                    {navitems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            target={item.href.includes('https') ? '_blank' : ''}
                            referrerPolicy={'no-referrer'}
                            className="rounded-full px-3 py-1 text-xl font-bold text-white transition duration-200 ease-in-out hover:bg-white hover:text-valencia"
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>
                <div className="flex w-[300px] flex-row items-center justify-center gap-x-4">
                    <Link
                        href="https://secure.actblue.com/donate/pvwebsite"
                        target="_blank"
                        className="hidden rounded-full bg-valencia px-4 py-2 text-xl font-bold text-white transition duration-300 ease-in-out hover:bg-white hover:text-black-pearl-dark xl:block"
                    >
                        Donate
                    </Link>
                    {!session ? (
                        <Link
                            href="/login"
                            className="hidden whitespace-nowrap rounded-full bg-steel-blue px-4 py-2 text-xl font-bold text-white transition duration-300 ease-in-out hover:bg-white hover:text-black-pearl-dark xl:block"
                        >
                            Log In
                        </Link>
                    ) : (
                        <Link
                            href="/account"
                            className="group hidden rounded-full bg-white p-1 text-white transition duration-300 ease-in-out hover:scale-105 hover:bg-valencia hover:text-black-pearl-dark xl:block"
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
                        <XMarkIcon className="size-8 text-white transition duration-300 ease-in-out group-hover:text-valencia" />
                    ) : (
                        <Bars3Icon className="size-8 text-white transition duration-300 ease-in-out group-hover:text-valencia" />
                    )}
                </button>
            </div>
            <Transition
                show={isOpen}
                enter="transition-all ease-in duration-200"
                enterFrom="-translate-y-full mt-2 "
                enterTo="translate-y-0 mt-0 opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo=" -translate-y-full"
            >
                <TransitionChild>
                    <div className="fixed inset-x-0 top-24 z-10 w-full rounded-b-lg bg-black-pearl-dark px-10 pb-12 pt-4 drop-shadow-xl xl:hidden">
                        <motion.div
                            className="mt-2 flex w-full flex-col items-center justify-start gap-y-4 pb-16"
                            initial="hidden"
                            animate="visible"
                            variants={containerVariants}
                        >
                            {navitems.map((item) => (
                                <Link
                                    href={item.href}
                                    key={item.name}
                                    target={
                                        item.href.includes('https')
                                            ? '_blank'
                                            : ''
                                    }
                                    referrerPolicy="no-referrer"
                                    className="w-full"
                                >
                                    <motion.div
                                        layoutId={item.name}
                                        variants={itemVariants}
                                        transition={springTransition}
                                        className="w-full cursor-pointer rounded-full px-2 py-4 text-center text-xl font-bold text-white hover:bg-white hover:text-valencia"
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
                                    variants={itemVariants}
                                    transition={springTransition}
                                    className="w-full cursor-pointer rounded-full bg-valencia px-2 py-4 text-center text-xl font-bold text-white hover:bg-white hover:text-black-pearl-dark"
                                >
                                    Donate
                                </motion.div>
                            </Link>
                            {!session ? (
                                <Link href="/login" className="w-full">
                                    <motion.div
                                        variants={itemVariants}
                                        transition={springTransition}
                                        className="w-full cursor-pointer rounded-full bg-steel-blue px-2 py-4 text-center text-xl font-bold text-white hover:bg-white hover:text-black-pearl-dark"
                                    >
                                        Log In
                                    </motion.div>
                                </Link>
                            ) : (
                                <Link href="/account" className="w-full">
                                    <motion.div
                                        variants={itemVariants}
                                        transition={springTransition}
                                        className="flex w-full cursor-pointer flex-row items-center justify-center gap-x-4 rounded-full bg-steel-blue p-2 text-center text-xl font-bold text-white hover:bg-white hover:text-black-pearl-dark"
                                    >
                                        <Image
                                            src={session.user?.image || ''}
                                            width={44}
                                            height={44}
                                            className="rounded-full border-2 border-white"
                                            alt="User Image"
                                        />
                                        Account
                                    </motion.div>
                                </Link>
                            )}
                        </motion.div>
                    </div>
                </TransitionChild>
            </Transition>
        </>
    )
}
