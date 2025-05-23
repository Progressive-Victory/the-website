'use client'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/solid'
import NextLink from 'next/link'
import Image from 'next/image'
import { Transition, TransitionChild } from '@headlessui/react'
import { useState } from 'react'
import { motion } from 'motion/react'
import { useSession } from 'next-auth/react'
import { NavItem } from './types'
import { Link } from '../common/Buttons'

// Tailwind class combos
const tw_hover = `transition duration-300 ease-in-out`
const tw_icon = `w-8 h-8 text-white group-hover:text-valencia ${tw_hover}`
const button_hover = `hover:bg-valencia ${tw_hover}`

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
      <div className="sticky top-0 flex flex-row items-center justify-between w-full px-6 z-[20] bg-black-pearl-dark h-[100px]">
        <NextLink href="/">
          <Image
            src="/images/LogoFull.webp"
            alt="progressive-victory-logo"
            width={256}
            height={78}
          />
        </NextLink>
        <div className="justify-center gap-x-12 w-full hidden xl:flex">
          {navitems.map((item) => (
            <Link key={item.name} href={item.href}>{item.name}</Link>
          ))}
        </div>
        <div className="flex flex-row items-center justify-center gap-x-4 w-[300px]">
          <Link
            href="https://secure.actblue.com/donate/pvwebsite"
            className="bg-valencia hidden xl:block"
          >
            Donate
          </Link>
          {!session ? (
            <Link href="/login" className="bg-steel-blue hidden xl:block">
              Log In
            </Link>
          ) : (
            <NextLink
              href="/account"
              className={`bg-white p-1 rounded-full hover:scale-105 hidden xl:block ${button_hover}`}
            >
              <Image
                src={session.user!.image || ''}
                className="rounded-full"
                alt="User Image"
                width={44}
                height={44}
              />
            </NextLink>
          )}
        </div>

        <button className="group xl:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? (
            <XMarkIcon className={tw_icon} />
          ) : (
            <Bars3Icon className={tw_icon} />
          )}
        </button>
      </div>

      <NavDrawer isOpen={isOpen}>
        {navitems.map((item) => (
          <Link
            href={item.href}
            key={item.name}
            className="w-full text-center py-4"
          >
            <motion.div
              layoutId={item.name}
              variants={itemVariants}
              transition={springTransition}
            >
              {item.name}
            </motion.div>
          </Link>
        ))}
        <Link
          href="https://secure.actblue.com/donate/pvwebsite"
          className="w-full text-center py-4 bg-valencia"
        >
          <motion.div
            variants={itemVariants}
            transition={springTransition}
          >
            Donate
          </motion.div>
        </Link>
        {!session ? (
          <Link href="/login" className="w-full text-center py-4 bg-steel-blue">
            <motion.div
              variants={itemVariants}
              transition={springTransition}
            >
              Log In
            </motion.div>
          </Link>
        ) : (
          <Link href="/account" className="w-full text-center bg-steel-blue">
            <motion.div
              variants={itemVariants}
              transition={springTransition}
              className="flex flex-row items-center justify-center gap-x-4"
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
      </NavDrawer>
    </>
  )
}

function NavDrawer(props: { isOpen: boolean, children: React.ReactNode }) {

  return (
    <Transition
      show={props.isOpen}
      enter="transition-all ease-in duration-200"
      enterFrom="-translate-y-full mt-2 "
      enterTo="translate-y-0 mt-0 opacity-100"
      leave="ease-in duration-200"
      leaveFrom="opacity-100"
      leaveTo=" -translate-y-full"
    >
      <TransitionChild>
        <div className="fixed rounded-b-lg drop-shadow-xl top-24 pb-12 left-0 right-0 w-full px-10 pt-4 z-10 bg-black-pearl-dark xl:hidden">
          <motion.div
            className="w-full flex flex-col items-center justify-start mt-2 gap-y-4 pb-16"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {props.children}
          </motion.div>
        </div>
      </TransitionChild>
    </Transition>
  )
}