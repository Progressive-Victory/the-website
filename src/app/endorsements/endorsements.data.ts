export type MessageTextSegment =
    | { type: 'text'; value: string }
    | { type: 'highlight'; value: string; href?: string }

export type InitiativeType = 'national' | 'state' | ''

export interface CandidateConfig {
    id: string
    name: string
    electionDate?: Date
    messageText: MessageTextSegment[]
    image: string
    learnMoreHref: string

    initiativeType: InitiativeType

    showPvPledge: boolean
    showPvMember: boolean
}
export const CANDIDATES: CandidateConfig[] = [
    {
        id: '1',
        name: 'Jeromie Whalen',
        electionDate: new Date('09/01/26'),
        messageText: [
            {
                type: 'highlight',
                value: '@jeromiewhalen',
                href: 'https://www.whalenforcongressma.com/',
            },
            {
                type: 'text',
                value: ' is not only a passionate progressive voice, he is also a powerful member of our community! There is nobody we are more excited to endorse this midterm season!',
            },
        ],
        image: '/images/endorsement_images/Jeromie Whalen.png',
        learnMoreHref: 'https://www.whalenforcongressma.com/platform',
        initiativeType: 'national',
        showPvPledge: true,
        showPvMember: true,
    },
    {
        id: '2',
        name: 'Abdul El-Sayed',
        electionDate: new Date('11/03/26'),
        messageText: [
            {
                type: 'highlight',
                value: '@abdulelsayed',
                href: 'https://x.com/AbdulElSayed',
            },
            {
                type: 'text',
                value: ' is challenging the status quo by embracing new ways to reach voters! With RFK and Trump’s attacks on medicine, a doctor like him is exactly what we need to pass Medicare For All!',
            },
        ],
        image: '/images/endorsement_images/Abdul El-Sayed.png',
        learnMoreHref: '',
        initiativeType: 'national',
        showPvPledge: false,
        showPvMember: false,
    },
    {
        id: '3',
        name: 'Saikat Chakrabarti',
        electionDate: new Date('06/02/26'),
        messageText: [
            {
                type: 'highlight',
                value: '@saikatc',
                href: 'https://x.com/saikatc',
            },
            {
                type: 'text',
                value: " founded the Justice Democrats because he belives in the left's ability to come togeather to fight establishment power. In congress, he will continue that energy!",
            },
        ],
        image: '/images/endorsement_images/Saikat Chakrabarti.png',
        learnMoreHref: '',
        initiativeType: 'national',
        showPvPledge: false,
        showPvMember: false,
    },
    {
        id: '4',
        name: 'Kat Abughazaleh',
        electionDate: new Date('03/17/26'),
        messageText: [
            {
                type: 'highlight',
                value: '@katabughazaleh',
                href: 'https://x.com/KatAbughazaleh',
            },
            {
                type: 'text',
                value: ' is exactly what we are looking for at PV. A young, media savvy firebrand willing to tackle any challenge that gets in her way.',
            },
        ],
        image: '/images/endorsement_images/Kat Abughazaleh.png',
        learnMoreHref: '',
        initiativeType: 'national',
        showPvPledge: false,
        showPvMember: false,
    },
    {
        id: '5',
        name: 'Graham Platner',
        electionDate: new Date('11/03/26'),
        messageText: [
            {
                type: 'highlight',
                value: '@grahamformaine',
                href: 'https://x.com/grahamformaine',
            },
            {
                type: 'text',
                value: ' is what happens when normal people get fed up and run for office over sanitized aspiring political wannabes! Our Maine team is so excited to get to work on his behalf!',
            },
        ],
        image: '/images/endorsement_images/Graham Platner.png',
        learnMoreHref: '',
        initiativeType: 'national',
        showPvPledge: false,
        showPvMember: false,
    },
    {
        id: '6',
        name: 'Salaam Bhatti',
        electionDate: new Date('08/01/26'),
        messageText: [
            {
                type: 'highlight',
                value: '@salaambhattiva',
                href: 'https://x.com/SalaamBhattiVA',
            },
            {
                type: 'text',
                value: '',
            },
        ],
        image: '/images/endorsement_images/Salaam Bhatti.png',
        learnMoreHref: '',
        initiativeType: 'state',
        showPvPledge: true,
        showPvMember: false,
    },
    {
        id: '7',
        name: 'Karishma Manzur',
        electionDate: new Date('09/08/26'),
        messageText: [
            {
                type: 'highlight',
                value: 'karishma4senate',
                href: 'https://x.com/Karishma4Senate',
            },
            {
                type: 'text',
                value: '',
            },
        ],
        image: '/images/endorsement_images/Karishma Manzur.png',
        learnMoreHref: '',
        initiativeType: '',
        showPvPledge: false,
        showPvMember: false,
    },
    {
        id: '8',
        name: 'Oliver Larkin',
        electionDate: new Date('08/18/26'),
        messageText: [
            {
                type: 'highlight',
                value: '@oliveralarkin',
                href: 'https://x.com/OliverALarkin',
            },
            {
                type: 'text',
                value: ' is proving Progressive politics is alive and well even in places like Florida! We are proud to endorse him and to do our part to help him win.',
            },
        ],
        image: '/images/endorsement_images/Oliver Larkin.png',
        learnMoreHref: '',
        initiativeType: 'state',
        showPvPledge: true,
        showPvMember: false,
    },
    {
        id: '9',
        name: 'Heath Howard',
        electionDate: new Date('09/08/26'),
        messageText: [
            {
                type: 'highlight',
                value: '@heathhowardnh',
                href: 'https://x.com/HeathHowardNH',
            },
            {
                type: 'text',
                value: '',
            },
        ],
        image: '/images/endorsement_images/Heath Howard.png',
        learnMoreHref: '',
        initiativeType: 'state',
        showPvPledge: false,
        showPvMember: true,
    },
    {
        id: '10',
        name: 'Adam Murphy',
        electionDate: new Date('08/01/26'),
        messageText: [
            {
                type: 'highlight',
                value: 'murphy4va',
                href: 'https://x.com/Murphy4VA',
            },
            {
                type: 'text',
                value: ' has quickly become a beloved presence in the PV community. We are proud to endorse him for Virginia’s 9th Congressional District.',
            },
        ],
        image: '/images/endorsement_images/AdamMurphy.png',
        learnMoreHref: '',
        initiativeType: 'state',
        showPvPledge: true,
        showPvMember: true,
    },
    {
        id: '11',
        name: 'Analilia Mejia',
        electionDate: new Date('02/05/26'),
        messageText: [
            {
                type: 'highlight',
                value: '@analilia_mejia',
                href: 'https://x.com/Analilia_Mejia',
            },
            {
                type: 'text',
                value: ' is a life long organizer who will be instrumental in organizing the progressive movement from within congress! We are thrilled to endorse her, and to see her take the PV Pledge.',
            },
        ],
        image: '/images/endorsement_images/Analilia Mejia.png',
        learnMoreHref: '',
        initiativeType: 'national',
        showPvPledge: true,
        showPvMember: false,
    },
    {
        id: '12',
        name: 'Mary Peltola',
        electionDate: new Date('11/03/26'),
        messageText: [
            {
                type: 'highlight',
                value: '@marypeltola',
                href: 'https://x.com/MaryPeltola',
            },
            {
                type: 'text',
                value: '',
            },
        ],
        image: '/images/endorsement_images/Mary Peltola.png',
        learnMoreHref: '',
        initiativeType: 'state',
        showPvPledge: false,
        showPvMember: false,
    },
    {
        id: '13',
        name: 'Erica Watkins',
        electionDate: new Date('11/03/26'),
        messageText: [
            {
                type: 'highlight',
                value: '@erica4ok',
                href: 'https://x.com/erica4ok',
            },
            {
                type: 'text',
                value: '',
            },
        ],
        image: '/images/endorsement_images/Erica Watkins.png',
        learnMoreHref: '',
        initiativeType: 'state',
        showPvPledge: true,
        showPvMember: true,
    },
    {
        id: '14',
        name: 'Taylor Rehmet',
        electionDate: new Date('01/27/26'),
        messageText: [
            {
                type: 'highlight',
                value: '@taylorrehmettx',
                href: 'https://x.com/TaylorRehmetTX',
            },
            {
                type: 'text',
                value: '',
            },
        ],
        image: '/images/endorsement_images/Taylor Rehmet.png',
        learnMoreHref: '',
        initiativeType: 'state',
        showPvPledge: false,
        showPvMember: false,
    },
    {
        id: '15',
        name: 'Luis Villarreal',
        electionDate: new Date('11/03/26'),
        messageText: [
            {
                type: 'highlight',
                value: '@luis4utah',
                href: 'https://x.com/Luis4Utah',
            },
            {
                type: 'text',
                value: '',
            },
        ],
        image: '/images/endorsement_images/Luis Villarreal.png',
        learnMoreHref: '',
        initiativeType: 'state',
        showPvPledge: true,
        showPvMember: true,
    },
    {
        id: '16',
        name: 'Brad Lander',
        electionDate: new Date('11/03/26'),
        messageText: [
            {
                type: 'highlight',
                value: '@bradlander',
                href: 'https://x.com/bradlander',
            },
            {
                type: 'text',
                value: '',
            },
        ],
        image: '/images/endorsement_images/Brad Lander.png',
        learnMoreHref: '',
        initiativeType: '',
        showPvPledge: false,
        showPvMember: false,
    },
    {
        id: '17',
        name: 'Ro Khanna',
        electionDate: new Date('11/03/26'),
        messageText: [
            {
                type: 'highlight',
                value: '@rokhanna',
                href: 'https://x.com/RoKhanna',
            },
            {
                type: 'text',
                value: ' is the leader our party needs! His commitment to new media politics has made him an outstanding voice capable of real change.',
            },
        ],
        image: '/images/endorsement_images/Ro Khanna.png',
        learnMoreHref: '',
        initiativeType: '',
        showPvPledge: false,
        showPvMember: false,
    },
    {
        id: '18',
        name: 'Cori Bush',
        electionDate: new Date('08/04/26'),
        messageText: [
            {
                type: 'highlight',
                value: '@coribush',
                href: 'https://x.com/CoriBush',
            },
            {
                type: 'text',
                value: ' is back to finish what she started! Her passion and tenacity have repeatedly shown that she is a powerful progressive voice ready to take on whatever battle is needed.',
            },
        ],
        image: '/images/endorsement_images/Cori Bush.png',
        learnMoreHref: '',
        initiativeType: '',
        showPvPledge: false,
        showPvMember: false,
    },
    {
        id: '19',
        name: 'James Talarico',
        electionDate: new Date('03/03/26'),
        messageText: [
            {
                type: 'highlight',
                value: '@jamestalarico',
                href: 'https://x.com/jamestalarico',
            },
            {
                type: 'text',
                value: "'s time has come to turn Texas blue. PV is proud to endorse him for the US Senate Seat in Texas! He is exctly what is needed.",
            },
        ],
        image: '/images/endorsement_images/James Talarico.png',
        learnMoreHref: '',
        initiativeType: 'national',
        showPvPledge: false,
        showPvMember: false,
    },
    {
        id: '20',
        name: 'Jon Stewart',
        electionDate: new Date('11/07/28'),
        messageText: [
            {
                type: 'highlight',
                value: '@jonstewart',
                href: 'https://x.com/jonstewart',
            },
            {
                type: 'text',
                value: ' isn’t perfect, but his decades long track record of integrity and progressivism make him the decisive pick. We urge him to serve his country by running for the office.',
            },
        ],
        image: '/images/endorsement_images/Jon Stewart.png',
        learnMoreHref: '',
        initiativeType: '',
        showPvPledge: false,
        showPvMember: false,
    },
    {
        id: '21',
        name: 'Zeeshan Hafeez',
        electionDate: new Date('03/03/26'),
        messageText: [
            { type: 'highlight', value: '@zeeshanfortexas', href: '' },
            {
                type: 'text',
                value: "is going to bring a fire to Texa's 33rd Congressional District. We are excited to see a bold progressive like him making all the right waves in all the right places!",
            },
        ],
        image: '/images/endorsement_images/Zeeshan Hafeez.png',
        learnMoreHref: '',
        initiativeType: 'national',
        showPvPledge: true,
        showPvMember: false,
    },
    {
        id: '21',
        name: 'Michael Black',
        electionDate: new Date('06/23/26'),
        messageText: [
            {
                type: 'highlight',
                value: '@MrMikeBlake',
                href: 'https://x.com/MrMikeBlake',
            },
            {
                type: 'text',
                value: ' is an authentic, progressive fighter who has a deep love for his community. The progressive movement won in New Jersey and he will bring that momentum to New York!',
            },
        ],
        image: '/images/endorsement_images/Michael Blake.png',
        learnMoreHref: '',
        initiativeType: '',
        showPvPledge: true,
        showPvMember: false,
    },
]
