import styles from '@/app/initiative/Initiative.module.css'
import {
    ContentPageFrame,
    ContentSection,
} from '@/components/content_sections/ContentSections'
import { HalftoneBackground } from '@/components/halftone/HalftoneBackground'
import { MainLayout } from '@/components/layout/MainLayout'
import type { Metadata } from 'next'
import type React from 'react'

export const metadata: Metadata = {
    title: 'PV - Initiative',
    description: 'Learn more about our initiatives.',
    openGraph: {
        title: 'PV - Initiative',
        url: 'https://www.progressivevictory.win/',
        siteName: 'Progressive Victory',
        images: [
            { url: 'https://www.progressivevictory.win/images/banner.png' },
        ],
    },
}

function InitiativeContent() {
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
                    legislature phonebank and providing traning and material on
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
                    <br />
                    <br />
                    Click this link to call your local representatives:{' '}
                    <a
                        href="https://www.progressivevictory.win/login?redirect=/volunteer"
                        className={styles.actionLink}
                    >
                        {'unfilled'}
                    </a>
                </p>
            </ContentSection>

            <ContentSection title="Step 3 - Call the FIVE Key Congresspeople">
                <p className={styles.initiativeBody}>
                    After calling your representatives, join the second
                    phonebank to call the FIVE congresspeople who we have
                    determined to be the most valuable to reach. (Make sure to
                    join the Discord to learn why we are targeting these five.)
                    The five key congresspeople are: Ro Khanna, Thomas Massie,
                    Frank Pallone, Doris Matsui, Amy Klobuchar.
                    <br />
                    <br />
                    Click this link to start dialing:{' '}
                    <a
                        href="https://www.progressivevictory.win/login?redirect=/volunteer"
                        className={styles.actionLink}
                    >
                        {'unfilled'}
                    </a>
                </p>
            </ContentSection>

            <ContentSection title="Step 4 - Get your PV Membership Card">
                <p className={styles.initiativeBody}>
                    Become a Dues Paying Member of Progressive Victory for just
                    $5/month and get your PV Membership Card and help us have
                    the necessary funds to navigate opperating on a hostile
                    platform like Discord.
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
            </ContentSection>
        </ContentPageFrame>
    )
}

export default function InitiativePage() {
    return (
        <MainLayout>
            <div className="container">
                <HalftoneBackground />
                <InitiativeContent />
            </div>
        </MainLayout>
    )
}
