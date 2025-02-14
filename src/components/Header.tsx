'use client'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'
import Image from 'next/image'
import { Transition } from '@headlessui/react'
import { useState } from 'react'
import { motion } from 'framer-motion'
const navitems = [
    {
        name: 'Home',
        href: '/',
    },
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
        href: '/contact',
    },
]
export function Header() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <div className="sticky top-0 left-0 right-0 flex flex-row items-center justify-between w-full gap-x-4 px-6 md:px-12 py-4 z-10 bg-prussian">
                <Link href="/">
                    <div className="flex flex-row items-center justify-start gap-x-4 flex-0">
                        <Image
                            src="/images/LogoFull.webp"
                            alt="progressive-victory-logo"
                            width={256}
                            height={256}
                        />
                    </div>
                </Link>
                <div className="flex flex-row items-center justify-center gap-x-12 cursor-pointer hidden lg:flex w-full">
                    {navitems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="text-xl text-white font-bold hover:text-valencia hover:bg-white rounded-full px-2 py-1 transition duration-200 ease-in-out"
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>
                <Link
                    href="https://secure.actblue.com/donate/pvwebsite"
                    className="text-xl bg-valencia px-4 py-2 rounded-full text-white font-bold hover:bg-white hover:text-black transition duration-300 ease-in-out hidden lg:block"
                >
                    Donate
                </Link>
                <button
                    className="group lg:hidden"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? (
                        <XMarkIcon className="w-8 h-8 text-white group-hover:text-valencia transition duration-300 ease-in-out" />
                    ) : (
                        <Bars3Icon className="w-8 h-8 text-white group-hover:text-valencia transition duration-300 ease-in-out" />
                    )}
                </button>
            </div>
            <Transition
                show={isOpen}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <div className="sticky top-0 left-0 right-0 flex flex-col items-center justify-center w-full px-4 py-4 z-10 bg-prussian overflow-hidden">
                    {navitems.map((item, index) => (
                        <motion.div
                            key={item.name}
                            layoutId={item.name}
                            initial={{ x: '-100vw', opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{
                                duration: 0.2,
                                ease: 'easeIn',
                                delay: index * 0.1,
                            }}
                            className="cursor-pointer text-center text-xl text-white font-bold hover:text-valencia hover:bg-white w-full px-2 py-4 transition duration-200 ease-in-out"
                        >
                            <Link href={item.href}>{item.name}</Link>
                        </motion.div>
                    ))}
                    <motion.div
                        initial={{ x: '-100vw', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{
                            duration: 0.2,
                            ease: 'easeIn',
                        }}
                        className="cursor-pointer text-center text-xl text-white bg-valencia font-bold w-full px-2 py-4"
                    >
                        <Link href="https://secure.actblue.com/donate/pvwebsite">
                            Donate
                        </Link>
                    </motion.div>
                </div>
            </Transition>
        </>
    )
}
