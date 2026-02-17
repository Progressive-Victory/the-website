'use client'

import { LogoutButton } from '../common/buttons/button_types/LogoutButton'
import { NavItem } from './types'
import { BaseButton } from '@/components/common/buttons/Button'
import buttonStyles from '@/components/common/buttons/Button.module.css'
import { LoginButton } from '@/components/common/buttons/button_types/LoginButton'
import { NavButton } from '@/components/common/buttons/button_types/NavButton'
import { DonateButton } from '@/components/common/buttons/button_types/donate_button/DonateButton'
import styles from '@/components/layout/footer.module.css'
import { motion } from 'motion/react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
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
    { name: 'Merch', href: 'https://progressivevictory.myshopify.com/' },
]

export function Footer() {
    return (
        <div className={styles.footerRoot}>
            <MobileFooter />
            <DesktopFooter />
        </div>
    )
}

function MobileFooter() {
    const { data: session } = useSession()

    return (
        <div className={styles.mobileFooterContainer}>
            <div className={styles.mobileInner}>
                <div className={styles.mobileLogoRow}>
                    <DonateButton
                        label="Donate"
                        className={styles.mobileDonateTop}
                    />

                    <div className={styles.mobileLogoWrapLarge}>
                        <Image
                            src="/images/LogoFull.webp"
                            alt="progressive-victory-logo"
                            width={256}
                            height={256}
                        />
                    </div>

                    <div className={styles.mobileLogoWrapSmall}>
                        <Image
                            src="/images/LogoFull.webp"
                            alt="progressive-victory-logo"
                            width={200}
                            height={200}
                        />
                    </div>
                </div>

                <div className={styles.mobileTopNavRow}>
                    {navitems.map((item) => (
                        <NavButton
                            key={item.name}
                            label={item.name}
                            href={item.href}
                            className={`${buttonStyles.plain} ${styles.mobileTopNavLink}`}
                        />
                    ))}
                </div>

                <div className={styles.mobileSocialsRowCompact}>
                    <DonateButton
                        label="Donate"
                        className={styles.mobileDonateSmOnly}
                    />

                    {socials.map((social) => (
                        <SocialIcon
                            key={social}
                            url={social}
                            fgColor="white"
                            className={styles.mobileSocialIconFixed}
                        />
                    ))}
                </div>

                <div className={styles.mobileSocialsRowFull}>
                    <DonateButton
                        label="Donate"
                        className={styles.mobileDonateSmOnly}
                    />

                    {socials.map((social) => (
                        <SocialIcon
                            key={social}
                            url={social}
                            fgColor="white"
                            className={styles.mobileSocialIconAuto}
                        />
                    ))}
                </div>

                <div className={styles.mobileDisclaimer}>
                    PAID FOR BY PROGRESSIVE VICTORY{' '}
                    <BaseButton
                        label="WWW.PROGRESSIVEVICTORY.WIN"
                        href="https://progressivevictory.win"
                        className={styles.disclaimerLink}
                    />{' '}
                    NOT AUTHORIZED BY ANY CANDIDATE OR CANDIDATE’S COMMITTEE.
                </div>

                <div className={styles.mobileBottomNavRow}>
                    <BaseButton
                        label="Contact"
                        href="https://docs.google.com/forms/d/e/1FAIpQLSdBRKV6bbxcx6HtNALWyjAwvEXbGSIG9s7iFEFlCEImVXILHA/viewform"
                        className={`${buttonStyles.plain} ${styles.mobileBottomNavLink}`}
                    />
                    <BaseButton
                        label="Privacy Policy"
                        href="/privacy"
                        className={`${buttonStyles.plain} ${styles.mobileBottomNavLink}`}
                    />

                    {session ? (
                        <LogoutButton
                            label="Sign Out"
                            callbackUrl="/"
                            className={`${buttonStyles.plain} ${styles.mobileBottomNavButton}`}
                        />
                    ) : (
                        <LoginButton
                            label="Log In"
                            href="/login"
                            className={`${buttonStyles.plain} ${styles.mobileBottomNavLink}`}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}

function DesktopFooter() {
    const { data: session } = useSession()

    return (
        <div className={styles.desktopFooterContainer}>
            <div className={styles.desktopInner}>
                <div className={styles.desktopTopRow}>
                    <div className={styles.desktopDividerTop} />

                    <div className={styles.desktopTopRight}>
                        {navitems.map((item) => (
                            <NavButton
                                key={item.name}
                                label={item.name}
                                href={item.href}
                                className={`${buttonStyles.plain} ${styles.topNavButtonAdjustment}`}
                            />
                        ))}

                        <DonateButton
                            label="Donate"
                            className={styles.desktopTopDonateButton}
                        />
                    </div>
                </div>

                <div className={styles.desktopMiddleRow}>
                    <div className={styles.desktopLeft}>
                        <div className={styles.desktopDisclaimer}>
                            PAID FOR BY PROGRESSIVE VICTORY{' '}
                            <BaseButton
                                label="WWW.PROGRESSIVEVICTORY.WIN"
                                href="https://progressivevictory.win"
                                className={styles.disclaimerLink}
                            />{' '}
                            NOT AUTHORIZED BY ANY CANDIDATE OR CANDIDATE’S
                            COMMITTEE.
                        </div>
                    </div>

                    <div className={styles.desktopLogoWrap}>
                        <Image
                            src="/images/Logo_White.svg"
                            alt="progressive-victory-icon"
                            width={200}
                            height={200}
                        />
                    </div>

                    <div className={styles.desktopRight}>
                        <motion.div className={styles.desktopSocials}>
                            {socials.map((social) => (
                                <SocialIcon
                                    key={social}
                                    url={social}
                                    fgColor="white"
                                    className={styles.socialIcons}
                                />
                            ))}
                        </motion.div>

                        <DonateButton
                            label="Donate"
                            className={styles.desktopMiddleDonateButton}
                        />
                    </div>
                </div>

                <div className={styles.desktopBottomRow}>
                    <div className={styles.desktopDividerBottom} />

                    <div className={styles.desktopBottomRight}>
                        <BaseButton
                            label="Contact"
                            href="https://docs.google.com/forms/d/e/1FAIpQLSdBRKV6bbxcx6HtNALWyjAwvEXbGSIG9s7iFEFlCEImVXILHA/viewform"
                            className={`${buttonStyles.plain} ${styles.bottomNavButtonAdjustment}`}
                        />
                        <BaseButton
                            label="Privacy Policy"
                            href="/privacy"
                            className={`${buttonStyles.plain} ${styles.bottomNavButtonAdjustment}`}
                        />
                        {session ? (
                            <LogoutButton
                                label="Sign Out"
                                callbackUrl="/"
                                className={`${buttonStyles.plain} ${styles.bottomNavButtonAdjustment}`}
                            />
                        ) : (
                            <LoginButton
                                label="Log In"
                                href="/login"
                                className={`${buttonStyles.plain} ${styles.bottomNavButtonAdjustment}`}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
