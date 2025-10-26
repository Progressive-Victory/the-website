const content = [
    {
        title: 'Our',
        emphasis: 'Mission',
        description: `Built by the internet, for America. Progressive Victory is a new kind of political institution: seamlessly marrying the electoral impact and volunteer power of traditional progressive organizations with the culture and community of digital third places. 
                      \nDedicated to pushing the Democratic Party to the left, we partner with left-aligned content creators to activate their disaffected, terminally online audiences converting them into lifelong, on the ground organizers. Providing the necessary structure & resources to empower viewers into volunteers, our innovative, community-first model utilizes familiar online spaces to introduce
                      & demystify the world of political organizing. 
                      \nProgressive Victory embraces queer & neurodivergent, new-to-activism volunteers of all backgrounds, ethnicities, and abilities. Over the long term, we aim to mainstream the online, progressive power block burgeoning within the Democratic Party and prove that it, and us, are too big to ignore.`,
    },
    {
        title: 'Our',
        emphasis: 'Community',
        description: `Progressive Victory is a new kind of political community — built by the internet, for the internet. Our community is turning the tides in elections across the country. Progressive Victory seeks to challenge the traditional methods of political organizing by engaging people through online media, with a focus on building solidarity with streamers and social influencers.
                    \nThe PV community is based online, hosted in a dedicated Discord server. PV works closely with online content creators on Twitch and YouTube to get their engaged, dedicated audiences into the PV community Discord. There, we’re bringing new people into the political process by giving them the tactics, resources, and support to make their voices heard.
                    \nProgressive Victory is constantly growing, with new members joining the community every day. The community is built upon the values of equity and inclusion, with a zero tolerance policy for hate. All members are asked to sign on to the PV rules before gaining access to the community and are upheld to the highest standards.`,
    },
]

export default function AboutCards() {
    return (
        <>
            <p className="w-full text-center text-4xl font-bold text-white">
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
        </>
    )
}

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
        <div className="z-2 mx-3 rounded-lg bg-black-pearl-dark p-4 px-6 text-center lg:w-2/3">
            <h1 className="py-2 text-4xl font-bold text-white">
                {title} <span className="text-valencia">{emphasis}</span>
            </h1>
            <p className="text-md whitespace-pre-line py-4 text-left font-[500] text-white lg:text-lg">
                {description}
            </p>
        </div>
    )
}
