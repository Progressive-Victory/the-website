'use client'

import { NavItem } from './types'
import styles from '@/app/styles/pages/Header.module.css'
import { ModularButton } from '@/components/common/ButtonComponent'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/solid'
import { AnimatePresence, motion } from 'motion/react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import NextLink from 'next/link'
import type React from 'react'
import { useState } from 'react'

const navitems: NavItem[] = [
    { name: 'About', href: '/about' },
    { name: 'Volunteer', href: '/volunteer' },
    { name: 'Events', href: '/events' },
    { name: 'Merch', href: 'https://progressivevictory.myshopify.com/' },
    {
        name: 'Contact',
        href: 'https://docs.google.com/forms/d/e/1FAIpQLSdBRKV6bbxcx6HtNALWyjAwvEXbGSIG9s7iFEFlCEImVXILHA/viewform',
    },
]

export function Header() {
    const [isOpen, setIsOpen] = useState(false)
    const { data: session } = useSession()
    const avatarSrc = session?.user?.image ?? ''

    return (
        <>
            <header className={styles.headerRoot}>
                <div className={styles.headerLogoSmall}>
                    <NextLink href="/">
                        <Image
                            src="/images/Logo_White.svg"
                            alt="progressive-victory-logo"
                            width={62.25}
                            height={78}
                        />
                    </NextLink>
                </div>

                <div className={styles.headerLogoLarge}>
                    <NextLink href="/">
                        <Image
                            src="/images/LogoFull.webp"
                            alt="progressive-victory-logo"
                            width={256}
                            height={78}
                        />
                    </NextLink>
                </div>

                <nav
                    className={styles.headerCenterNav}
                    aria-label="Primary navigation"
                >
                    {navitems.map(({ name, href }) => (
                        <ModularButton
                            key={name}
                            label={name}
                            buttonType="nav"
                            href={href}
                        />
                    ))}
                </nav>

                <div className={styles.headerRightActions}>
                    <ModularButton label="Donate" buttonType="donate" />

                    {!session ? (
                        <ModularButton
                            label="Log In"
                            buttonType="login"
                            href="/login"
                        />
                    ) : (
                        <ModularButton
                            label="Account"
                            buttonType="account"
                            href="/account"
                            avatarSrc={avatarSrc}
                            avatarAlt="User avatar"
                        />
                    )}
                </div>

                <motion.button
                    type="button"
                    className={styles.headerMenuButton}
                    onClick={() => setIsOpen((prev) => !prev)}
                    whileHover={{
                        scale: 1.08,
                        color: '#CE3728',
                    }}
                    whileTap={{
                        scale: 0.9,
                    }}
                    animate={{
                        color: '#FFFFFF',
                    }}
                    transition={{
                        type: 'spring',
                        stiffness: 320,
                        damping: 22,
                    }}
                    aria-label={
                        isOpen
                            ? 'Close navigation menu'
                            : 'Open navigation menu'
                    }
                    aria-expanded={isOpen}
                    aria-controls="site-nav-drawer"
                >
                    <motion.span
                        className={styles.headerMenuIconWrapper}
                        animate={{
                            rotate: isOpen ? 90 : 0,
                        }}
                        transition={{
                            type: 'spring',
                            stiffness: 260,
                            damping: 20,
                        }}
                    >
                        {isOpen ? (
                            <XMarkIcon className={styles.headerMenuIcon} />
                        ) : (
                            <Bars3Icon className={styles.headerMenuIcon} />
                        )}
                    </motion.span>
                </motion.button>
            </header>

            <NavDrawer isOpen={isOpen}>
                {navitems
                    .map(({ href, name }) => (
                        <ModularButton
                            key={name}
                            label={name}
                            buttonType="nav"
                            href={href}
                            buttonVariant="long"
                        />
                    ))
                    .concat(
                        <ModularButton
                            key="donate-mobile"
                            label="Donate"
                            buttonType="donate"
                            buttonVariant="long"
                        />
                    )
                    .concat(
                        !session ? (
                            <ModularButton
                                label="Log In"
                                buttonType="login"
                                buttonVariant="long"
                                href="/login"
                                key="login-mobile"
                            />
                        ) : (
                            <ModularButton
                                label="Account"
                                buttonType="account"
                                buttonVariant="long"
                                href="/account"
                                avatarSrc={avatarSrc}
                                avatarAlt="User avatar"
                                key="account-mobile"
                            />
                        )
                    )}
            </NavDrawer>
        </>
    )
}

const containerVariants = {
    hidden: {
        y: '-100%',
        transition: {
            type: 'tween',
            ease: 'easeInOut',
            duration: 0.2,
        },
    },
    visible: {
        y: '-2%',
        transition: {
            ease: 'easeInOut',
            type: 'spring',
            stiffness: 250,
            damping: 25,
            staggerChildren: 0.05,
        },
    },
}

const itemVariants = {
    hidden: { y: '-200%', opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            ease: 'easeInOut',
            type: 'spring',
            stiffness: 300,
            damping: 20,
        },
    },
}

function NavDrawer(props: { isOpen: boolean; children: React.ReactNode[] }) {
    const { isOpen, children } = props
    const shouldRender = isOpen

    return (
        <AnimatePresence>
            {shouldRender && (
                <motion.nav
                    key="nav-drawer"
                    id="site-nav-drawer"
                    aria-label="Mobile navigation"
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={containerVariants}
                    className={styles.navDrawer}
                >
                    {children.map((child, i) => (
                        <motion.div
                            key={i}
                            variants={itemVariants}
                            className={styles.navDrawerItem}
                        >
                            {child}
                        </motion.div>
                    ))}
                </motion.nav>
            )}
        </AnimatePresence>
    )
}
