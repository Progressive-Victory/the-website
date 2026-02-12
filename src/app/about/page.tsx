import { AccountInfoForm } from '../account/AccountInfoForm'
import FAQ from './FAQ'
import styles from '@/app/about/about.module.css'
import {
    ContentPageFrame,
    ContentSection,
} from '@/components/content_sections/ContentSections'
import { HalftoneBackground } from '@/components/halftone/HalftoneBackground'
import { MainLayout } from '@/components/layout/MainLayout'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'PV - About',
    description: 'Learn about Progressive Victory!',
    openGraph: {
        title: 'PV - About',
        description: 'Learn about Progressive Victory!',
        url: `https://${process.env.SITE_URL}/`,
        siteName: 'Progressive Victory',
        images: [{ url: `https://${process.env.SITE_URL}/images/banner.png` }],
    },
}

function AboutContent() {
    return (
        <ContentPageFrame
            heading={
                <p className={styles.aboutHeading}>
                    About{' '}
                    <span className={styles.aboutHeadingHighlight}>
                        Progressive Victory
                    </span>
                </p>
            }
        >
            <ContentSection
                title="Our Mission"
                highlight="Mission"
                titleAlign="center"
            >
                <p>
                    {`Built by the internet, for America. Progressive Victory is a new kind of political institution: seamlessly marrying the electoral impact and volunteer power of traditional progressive organizations with the culture and community of digital third places. 
                      
Dedicated to pushing the Democratic Party to the left, we partner with left-aligned content creators to activate their disaffected, terminally online audiences, converting them into lifelong, on-the-ground organizers. Providing the necessary structure & resources to empower viewers into volunteers, our innovative, community-first model utilizes familiar online spaces to introduce & demystify the world of political organizing. 
                      
Progressive Victory embraces queer & neurodivergent, new-to-activism volunteers of all backgrounds, ethnicities, and abilities. Over the long term, we aim to mainstream the online, progressive power block burgeoning within the Democratic Party and prove that it, and us, are too big to ignore.`}
                </p>
            </ContentSection>

            <ContentSection
                title="Our Community"
                highlight="Community"
                titleAlign="center"
            >
                <p>
                    {`In the digital age, people are longing for community now more than ever. That is why PV prides itself on being a community-first. To achieve that, the idea of the town square is built deeply into the foundations of Progressive Victory. With our real-world town squares having been left to rot, we have had to resort to untraditional means to rekindle the feeling of community. Existing entirely within our meticulously crafted Discord server, our members are finding a home for themselves for the first time. 
                    
                    This is enabling us to turn the tides of elections across the country not in spite of our Discord community, but because of it. The dedication to maintaining a healthy and thriving progressive social space online is what enables our members to become world-class organizers. PV works closely with online content creators on Twitch and YouTube to get their engaged, dedicated audiences into the PV community. There, we’re bringing new people into the political process by giving them the resources and home to hone their voice.
                    
Progressive Victory is constantly growing, with new members joining every day. The community is built upon the values of equity and inclusion, with a zero-tolerance policy for hate. All members are from the United States, above the age of 18, and are asked to sign on to our rules & values before gaining access to the community.`}
                </p>
            </ContentSection>

            <FAQ />
        </ContentPageFrame>
    )
}

export default function About() {
    return (
        <MainLayout>
            <HalftoneBackground />
            <AccountInfoForm
                form={{
                    discordUsername: 'username',
                    discordId: 'ID',
                    firstName: 'first',
                    lastName: 'last',
                    county: 'King',
                    state: 'Washington',
                    city: 'Seattle',
                    emailAddress: 'ericoseid@gmail.com',
                    phoneNumber: '6036678599',
                    birthdate: new Date(),
                    zip: 12345,
                }}
            />
            <AboutContent />
        </MainLayout>
    )
}
