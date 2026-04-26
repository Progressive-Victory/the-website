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
    title: 'PV - Franklin Initiative',
    description: 'Learn more about our Jackson Franklin initiatives.',
    openGraph: {
        title: 'PV - Franklin Initiative',
        url: 'https://www.progressivevictory.win/',
        siteName: 'Progressive Victory',
        images: [
            { url: 'https://www.progressivevictory.win/images/banner.png' },
        ],
    },
}

function FranklinInitiativeContent() {
    return (
        <ContentPageFrame
            heading={
                <p className={styles.initiativeHeading}>
                    Jackson Franklin{' '}
                    <span className={styles.initiativeHeadingHighlight}>
                        Initiative
                    </span>
                </p>
            }
        >
            <ContentSection title="Step 1 - Join the Discord">
                <p className={styles.initiativeBody}>
                    Join the PV Discord to get started with the call campaign.
                    PV Leadership will be in Organizing VC 1 hosting the
                    phonebank and providing training and material on how best to
                    conduct your call.
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

            <ContentSection title="Step 2 - Get Started Phonebanking">
                <p className={styles.initiativeBody}>
                    Sign up for the phonebank on mobilize and select which
                    phonebank shifts you want to attend. The phonebanks will be
                    in the Discord every day from 5pm-8pm ET.
                </p>

                <ul className={styles.bulletList}>
                    Sign Up to Phonebank:
                    <li className={styles.bulletListItem}>
                        <a
                            href="https://www.mobilize.us/progressivevictory/event/944252/"
                            className={styles.actionLink}
                        >
                            Click Here to Schedule your Phonebank Time
                        </a>
                    </li>
                </ul>
            </ContentSection>

            <ContentSection title="Step 3 - Get your PV Membership Card">
                <div className={styles.cardContainer}>
                    <div>
                        <p className={styles.initiativeBody}>
                            Become a Dues Paying Member of Progressive Victory
                            for just $5/month and get your PV Membership Card
                            and help us have the necessary funds to accomplish
                            initiatives like this one.
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

export default function FranklinInitiativePage() {
    return (
        <MainLayout>
            <div className="container">
                <HalftoneBackground />
                <FranklinInitiativeContent />
            </div>
        </MainLayout>
    )
}
