'use client'

import type { NavItem } from './types'
import styles from '@/app/styles/components/footer.module.css'
import { useSession, signOut } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { SocialIcon } from 'react-social-icons'

const socials = [
    'https://www.twitch.tv/progressivevictory',
    'https://www.youtube.com/channel/UCRn-TsfTCP68oee03_F2eIg',
    'https://www.instagram.com/progressivevictory/',
    'https://bsky.app/profile/progressivevictory.win',
    'https://x.com/ProgressiveVic?mx=2',
]

const navitems: NavItem[] = [
    { name: 'About', href: '/about' },
    { name: 'Volunteer', href: '/volunteer' },
    { name: 'Events', href: '/events' },
    { name: 'Endorsements', href: '/endorsements' },
    { name: 'Merch', href: 'https://progressivevictory.myshopify.com/' },
]

export function Footer() {
    return (
        <footer className={styles.footerRoot}>
            <div className={styles.footerGlow} aria-hidden="true" />

            <div className={styles.inner}>
                <MobileFooter />
                <DesktopFooter />
            </div>
        </footer>
    )
}

function MobileFooter() {
    const { data: session } = useSession()

    return (
        <div className={styles.mobileOnly}>
            <div className={styles.mobileStack}>
                <div className={styles.mobileBrandRow}>
                    <Link
                        href="https://secure.actblue.com/donate/pvwebsite"
                        className={styles.donatePillMobile}
                    >
                        Donate
                    </Link>

                    <Link href="/" className={styles.brandLink}>
                        <Image
                            src="/images/LogoFull.webp"
                            alt="Progressive Victory"
                            width={220}
                            height={220}
                            priority={false}
                        />
                    </Link>
                </div>

                <div className={styles.mobileNavRow}>
                    {navitems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={styles.navPill}
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>

                <div className={styles.mobileSocialRow}>
                    {socials.map((social) => (
                        <div key={social} className={styles.socialWrap}>
                            <SocialIcon
                                url={social}
                                fgColor="white"
                                bgColor="transparent"
                                style={{ height: 44, width: 44 }}
                            />
                        </div>
                    ))}
                </div>

                <div className={styles.disclaimerBox}>
                    PAID FOR BY PROGRESSIVE VICTORY{' '}
                    <Link
                        href="https://progressivevictory.win"
                        className={styles.disclaimerLink}
                    >
                        WWW.PROGRESSIVEVICTORY.WIN
                    </Link>{' '}
                    NOT AUTHORIZED BY ANY CANDIDATE OR CANDIDATE’S COMMITTEE.
                </div>

                <div className={styles.mobileBottomRow}>
                    <Link
                        className={styles.navPill}
                        href="https://docs.google.com/forms/d/e/1FAIpQLSdBRKV6bbxcx6HtNALWyjAwvEXbGSIG9s7iFEFlCEImVXILHA/viewform"
                    >
                        Contact
                    </Link>

                    <Link className={styles.navPill} href="/privacy">
                        Privacy Policy
                    </Link>

                    {session ? (
                        <button
                            type="button"
                            onClick={() => void signOut({ callbackUrl: '/' })}
                            className={styles.navPillButton}
                        >
                            Sign Out
                        </button>
                    ) : (
                        <Link className={styles.navPill} href="/login">
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
        <div className={styles.desktopOnly}>
            <div className={styles.desktopFrame}>
                <div className={styles.desktopTopRow}>
                    <div className={styles.rule} aria-hidden="true" />

                    <div className={styles.desktopTopNav}>
                        {navitems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={styles.navPill}
                            >
                                {item.name}
                            </Link>
                        ))}

                        <Link
                            href="https://secure.actblue.com/donate/pvwebsite"
                            className={styles.donatePill}
                        >
                            Donate
                        </Link>
                    </div>
                </div>

                <div className={styles.desktopMidRow}>
                    <div className={styles.disclaimerBoxDesktop}>
                        PAID FOR BY PROGRESSIVE VICTORY{' '}
                        <Link
                            href="https://progressivevictory.win"
                            className={styles.disclaimerLink}
                        >
                            WWW.PROGRESSIVEVICTORY.WIN
                        </Link>{' '}
                        NOT AUTHORIZED BY ANY CANDIDATE OR CANDIDATE’S
                        COMMITTEE.
                    </div>

                    <div className={styles.desktopLogoWrap} aria-hidden="true">
                        <Image
                            src="/images/Logo_White.svg"
                            alt="Progressive Victory"
                            width={74}
                            height={74}
                        />
                    </div>

                    <div className={styles.desktopSocialCluster}>
                        <div className={styles.desktopSocialRow}>
                            {socials.map((social) => (
                                <div key={social} className={styles.socialWrap}>
                                    <SocialIcon
                                        url={social}
                                        fgColor="white"
                                        bgColor="transparent"
                                        style={{ height: 44, width: 44 }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className={styles.desktopBottomRow}>
                    <div className={styles.rule} aria-hidden="true" />

                    <div className={styles.desktopBottomNav}>
                        <Link
                            className={styles.navPill}
                            href="https://docs.google.com/forms/d/e/1FAIpQLSdBRKV6bbxcx6HtNALWyjAwvEXbGSIG9s7iFEFlCEImVXILHA/viewform"
                        >
                            Contact
                        </Link>

                        <Link className={styles.navPill} href="/privacy">
                            Privacy Policy
                        </Link>

                        {session ? (
                            <button
                                type="button"
                                onClick={() =>
                                    void signOut({ callbackUrl: '/' })
                                }
                                className={styles.navPillButton}
                            >
                                Sign Out
                            </button>
                        ) : (
                            <Link className={styles.navPill} href="/login">
                                Log In
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
