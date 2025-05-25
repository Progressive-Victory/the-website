'use client'
import { useState } from 'react'
import NextLink from 'next/link'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { AnimatePresence, motion } from 'motion/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/solid'
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
        {navitems
          .map(({ href, name }) => (
            <Link href={href} key={name} className="w-full py-4">
              {name}
            </Link>
          ))
          .concat(<Link
            href="https://secure.actblue.com/donate/pvwebsite"
            className="w-full text-center py-4 bg-valencia"
          >
            Donate
          </Link>)
          .concat(!session ? (
            <Link href="/login" className="w-full py-4 bg-steel-blue">
              Log In
            </Link>
          ) : (
            <Link href="/account" className="w-full bg-steel-blue">
              <Image
                src={session.user?.image || ''}
                width={44}
                height={44}
                className="rounded-full border-2 border-white mr-4"
                alt="User Image"
              />
              Account
            </Link>
          ))
        }
      </NavDrawer >
    </>
  )
}

const containerVariants = {
  hidden: {
    y: "-100%",
    transition: {
      type: "tween",
      ease: "easeInOut",
      duration: 0.2
    }
  },
  visible: {
    y: "-2%",
    transition: {
      ease: "easeInOut",
      type: "spring",
      stiffness: 250,
      damping: 25,
      staggerChildren: 0.05
    }
  }
}

const itemVariants = {
  hidden: { y: "-200%", opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      ease: "easeInOut",
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  }
}

function NavDrawer(props: { isOpen: boolean, children: React.ReactNode[] }) {

  return (
    <AnimatePresence>
      {props.isOpen && (
        <motion.div
          key="nav-drawer"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={containerVariants}
          className={`
            fixed inset-x-0 top-24 z-10 w-full rounded-b-lg
            bg-black-pearl-dark drop-shadow-xl
            px-10 pt-4 pb-16 xl:hidden
            flex flex-col gap-y-4
          `}
        >
          {props.children.map((child, i) => (
            <motion.div
              key={i}
              className="w-full"
              variants={itemVariants}
            >
              {child}
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}