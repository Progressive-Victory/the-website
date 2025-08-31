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
            <p className="text-md py-4 text-left font-[500] text-white lg:text-lg">
                {description}
            </p>
        </div>
    )
}
