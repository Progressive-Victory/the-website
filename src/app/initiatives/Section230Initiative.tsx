import InteractiveThreeCard from '@/app/home/MemberBanner'
import styles from '@/app/initiatives/Initiative.module.css'
import {
    ContentPageFrame,
    ContentSection,
} from '@/components/content_sections/ContentSections'
import { HalftoneBackground } from '@/components/halftone/HalftoneBackground'
import { MainLayout } from '@/components/layout/MainLayout'
import type { Metadata } from 'next'
import type React from 'react'

export const metadata: Metadata = {
    title: 'PV - Section 230 Initiative',
    description: 'Learn more about our Section 230 initiative.',
    openGraph: {
        title: 'PV - Section 230 Initiative',
        url: 'https://www.progressivevictory.win/',
        siteName: 'Progressive Victory',
        images: [
            { url: 'https://www.progressivevictory.win/images/banner.png' },
        ],
    },
}

function Section230InitiativeContent() {
    return (
        <ContentPageFrame
            heading={
                <p className={styles.initiativeHeading}>
                    Save{' '}
                    <span className={styles.initiativeHeadingHighlight}>
                        Section 230{' '}
                    </span>
                    Initiative
                </p>
            }
        >
            <ContentSection title="Step 1 - Join the Discord">
                <p className={styles.initiativeBody}>
                    Join the PV Discord to get started with the call campaign.
                    PV Leadership will be in Organizing VC 1 hosting the
                    legislature phonebank and providing training and material on
                    how best to conduct your call.
                    <br />
                    <br />
                    Click the link to:{' '}
                    <a
                        href="https://www.progressivevictory.win/login?redirect=/volunteer"
                        className={styles.inlineLink}
                    >
                        {'Join The Discord to Get Started'}
                    </a>
                </p>
            </ContentSection>

            <ContentSection title="Step 2 - Call YOUR Representatives">
                <p className={styles.initiativeBody}>
                    After recieving training and materials in the Discord, you
                    can start by making three calls to your House Rep and
                    Senators.
                </p>

                <ul className={styles.bulletList}>
                    Links to call your local representatives:
                    <li className={styles.bulletListItem}>
                        <a
                            href="https://progressive-victory.solidarity.tech/call-your-representative"
                            className={styles.actionLink}
                        >
                            Click Here to call your House Rep
                        </a>
                    </li>
                    <li className={styles.bulletListItem}>
                        <a
                            href="https://progressive-victory.solidarity.tech/call-your-senator"
                            className={styles.actionLink}
                        >
                            Click Here to call your Senators
                        </a>
                    </li>
                </ul>
            </ContentSection>

            <ContentSection title="Step 3 - Call the FIVE Key Congresspeople">
                <p className={styles.initiativeBody}>
                    After calling your representatives, join the second
                    phonebank to call the FIVE congresspeople who we have
                    determined to be the most valuable to reach. (Make sure to
                    join the Discord to learn why we are targeting these five.)
                    The five key congresspeople are: Ro Khanna, Thomas Massie,
                    Frank Pallone, Doris Matsui, Amy Klobuchar.
                </p>
                <ul className={styles.bulletList}>
                    Link to start dialing:
                    <li className={styles.bulletListItem}>
                        <a
                            href="https://progressive-victory.solidarity.tech/keep-section-230-call-congress"
                            className={styles.actionLink}
                        >
                            {'Click Here to Call 5 Key Congresspeople'}
                        </a>
                    </li>
                </ul>
            </ContentSection>

            <ContentSection title="Step 4 - Get your PV Membership Card">
                <div className={styles.cardContainer}>
                    <div>
                        <p className={styles.initiativeBody}>
                            Become a Dues Paying Member of Progressive Victory
                            for just $5/month and get your PV Membership Card
                            and help us have the necessary funds to navigate
                            opperating on a hostile platform like Discord.
                            <br />
                            <br />
                            Click this link to become a member:{' '}
                            <a
                                href="https://secure.actblue.com/donate/pvmember"
                                className={styles.inlineLink}
                            >
                                {'Become a Member'}
                            </a>
                        </p>
                    </div>
                    <div className={styles.membershipCardWrap}>
                        <InteractiveThreeCard
                            frontImage="/images/membercard_front.png"
                            backImage="/images/membercard_back.png"
                        />
                    </div>
                </div>
            </ContentSection>
        </ContentPageFrame>
    )
}

export default function Section230InitiativePage() {
    return (
        <MainLayout>
            <div className="container">
                <HalftoneBackground />
                <Section230InitiativeContent />
            </div>
        </MainLayout>
    )
}
