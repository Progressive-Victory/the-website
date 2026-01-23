export type Stage = 'Primary' | 'General' | 'Special'
export type Office =
    | 'President'
    | 'U.S. Senate'
    | 'U.S. House'
    | 'State Senate'
    | 'State House'
    | 'Governer'
    | 'Mayor'
    | 'Party Offical'

export type Issues =
    | 'Ranked Choice Voting'
    | 'Overturn Citizens United'
    | 'Congressional Stock Trading Ban'
    | 'Ending Revolving Door'
    | 'Medicare For All'
    | 'Codify Roe v. Wade'
    | 'Protecting Gender Affirming Care'
    | 'Expanding A.D.A.'
    | '$25 Dollor Minimum Wage'
    | 'Expanding Unionization'
    | 'Breaking Up Monopolies'
    | 'Defund Israel'
    | 'Defend Ukriane'
    | 'College For All'
    | 'Green New Deal'
    | 'Expanding Nuclear Power'
    | 'Abolish I.C.E.'
    | 'Abolish Private Prisons'
    | 'Pathway To Citizenship'
    | 'Nationalize Railroad Tracks'
    | 'High Speed Rail'
    | 'Expanding Fair Use'
    | 'Regulating A.I.'
    | 'Ending Preditory Lending'
    | 'Blank'

export interface Endorsement {
    id: string
    candidateName: string
    office: Office
    state: string
    district?: string
    stage?: Stage
    electionDate: string // Mon. xth/st, 20XX
    quote: string
    issues?: Issues[] // Issue are from PV Pledge

    PvPledge: boolean
    PVMember: boolean

    imageSrc: string
    imageAlt: string

    website: string
    donateLink: string
}

//  Abdul El-Sayed

//  Cori Bush
//  Graham Platner
//  Heath Howard
//  James Talarico
//  Jeromie Whalen
//  Josie Caballero
//  Kat Abughazaleh
//  Oliver Larkin
//  Saikat Chakrabarti
//  Karishma Manzur
//  Adam Murphy
//  Salaam Bhatti

export const ENDORSEMENTS: Endorsement[] = [
    {
        id: '1',
        candidateName: 'Analilia Mejia',
        office: 'U.S. House',
        state: 'NJ',
        district: 'NJ-11',
        stage: 'Special',
        electionDate: 'Feb. 5th, 2026',
        quote: 'Our official quote by some member of PV Leadership that is deeply unique and relevant.',
        issues: [
            'Overturn Citizens United',
            'Medicare For All',
            'College For All',
        ],
        PvPledge: false,
        PVMember: true,
        imageSrc: '/images/ANALILIA MEJIA.png',
        imageAlt: 'Analilia Mejia',
        website: 'https://www.analiliafornj.com',
        donateLink: 'https://secure.actblue.com/donate/analiliafornj',
    },
    {
        id: '2',
        candidateName: 'Jeromie Whalen',
        office: 'U.S. House',
        state: 'MA',
        district: 'MA-01',
        stage: 'Primary',
        electionDate: 'Sep. 1st, 2026',
        quote: 'Our official quote by some member of PV Leadership that is deeply unique and relevant.',
        issues: ['Blank', 'Blank', 'Blank'],
        PvPledge: true,
        PVMember: true,
        imageSrc: '/images/JEROMIE WHALEN.png',
        imageAlt: 'Jeromie Whalen',
        website: 'https://www.analiliafornj.com',
        donateLink: 'https://secure.actblue.com/donate/analiliafornj',
    },
    {
        id: '3',
        candidateName: 'Saikat Chakrabarti',
        office: 'U.S. House',
        state: 'CA',
        district: 'CA-11',
        stage: 'General',
        electionDate: 'Nov. 3rd, 2026',
        quote: 'In a year full of amazing candidates, Saikat stands out as a true progressive movement leader.',
        issues: ['Blank', 'Blank', 'Blank'],
        PvPledge: true,
        PVMember: false,
        imageSrc: '/images/SAIKAT CHAKRABARTI.png',
        imageAlt: 'Saikat Chakrabarti',
        website: 'https://www.analiliafornj.com',
        donateLink: 'https://secure.actblue.com/donate/analiliafornj',
    },
    {
        id: '4',
        candidateName: 'Karishma Manzur',
        office: 'U.S. Senate',
        state: 'NH',
        stage: 'Primary',
        electionDate: 'Sep. 8th, 2026',
        quote: 'Our official quote by some member of PV Leadership that is deeply unique and relevant.',
        issues: ['Blank', 'Blank', 'Blank'],
        PvPledge: true,
        PVMember: false,
        imageSrc: '/images/SAIKAT CHAKRABARTI.png',
        imageAlt: 'Saikat Chakrabarti',
        website: 'https://www.analiliafornj.com',
        donateLink: 'https://secure.actblue.com/donate/analiliafornj',
    },
]
