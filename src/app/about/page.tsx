import { MainLayout } from '@/components/MainLayout'
import { FAQ } from '@/components/FAQ'
function AboutCard({
    title,
    description,
    emphasis,
}: {
    title: string
    emphasis: string
    description: string
}) {
    return (
        <div className="bg-black-pearl-dark rounded-lg lg:w-2/3 p-6 px-12 text-center z-2">
            <h1 className="text-4xl font-bold text-white py-2">
                {title} <span className="text-valencia">{emphasis}</span>
            </h1>
            <p className="text-xl text-white text-left font-[500] py-4">
                {description}
            </p>
        </div>
    )
}

const content = [
    {
        title: 'Our',
        emphasis: 'Community',
        description: `Progressive Victory is a new kind of political community — built by the internet, for the internet. Our community is turning the tides in elections across the country. Progressive Victory seeks to challenge the traditional methods of political organizing by engaging people through online media, with a focus on building solidarity with streamers and social influencers.

                    The PV community is based online, hosted in a dedicated Discord server. PV works closely with online content creators on Twitch and YouTube to get their engaged, dedicated audiences into the PV community Discord. There, we’re bringing new people into the political process by giving them the tactics, resources, and support to make their voices heard.

                    Progressive Victory is constantly growing, with new members joining the community every day. The community is built upon the values of equity and inclusion, with a zero tolerance policy for hate. All members are asked to sign on to the PV rules before gaining access to the community and are upheld to the highest standards.`,
    },
    {
        title: 'Our',
        emphasis: 'Mission',
        description: `Progressive Victory is committed to building our community of new-to-activism volunteers by empowering members to develop the skills and gain the knowledge needed to become lifelong activists. Progressive Victory’s unifying mission is to ensure progressive candidates are elected to positions of power and progressive policy is implemented. Over the long term, Progressive Victory aims to create a progressive power block within the Democratic Party that is too big to ignore.

                    Progressive Victory values unity above all, and seeks to connect progressives across the ideological spectrum with the common goal of creating a more just world. Regardless of our differences, we unite over the need to take pro-democracy action in these unprecedented times.`,
    },
]

/**
 * The About page.
 *
 * This page explains the purpose and goals of Progressive Victory, and how it
 * works.
 *
 * The page is divided into sections, each explaining a different aspect of
 * Progressive Victory. The sections are: Our Community, How it Works, and
 * Values.
 *
 * @returns The About page.
 */
export default function About() {
    return (
        <MainLayout>
            <div className="relative py-10 h-fit bg-steel-blue px-12">
                {/* Halftone background */}
                <div className="absolute inset-0 w-full h-full halftone opacity-10 z-1" />
                <div className="relative flex flex-col justify-start mt-10 items-center min-h-screen w-full m-auto gap-y-10 z-2">
                    <p className="text-4xl font-bold text-white w-full text-center">
                        About{' '}
                        <span className="text-black-pearl-dark">
                            Progressive Victory
                        </span>
                    </p>
                    {content.map((section) => (
                        <AboutCard
                            key={section.emphasis}
                            title={section.title}
                            emphasis={section.emphasis}
                            description={section.description}
                        />
                    ))}

                    <FAQ />
                </div>
            </div>
        </MainLayout>
    )
}
