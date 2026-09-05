export type MembershipTier =
    | 'Dues Paying Member'
    | 'Premium Member'
    | 'Signature Member'
    | 'Inner Circle Member'

export type ShirtSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL'

export type PackageShipped =
    | 'Yes'
    | 'No'
    | 'Returned'
    | 'Not Received'
    | 'Canceled'

export interface Member {
    id: number
    firstName?: string
    lastName?: string
    discordUsername?: string
    phone?: string
    email?: string
    address1?: string
    address2?: string
    city?: string
    state?: string
    zip?: string
    country?: string
    shirtSize?: ShirtSize

    isMember?: boolean
    eligibleForBenefits?: boolean
    beganMembership?: string
    membershipAmount?: number
    membershipTier?: MembershipTier
    numberOfContributions?: number

    discordConfirmed?: boolean
    nameConfirmed?: boolean
    addressConfirmed?: boolean
    cardPrinted?: boolean
    labelPrinted?: boolean
    cardPacked?: boolean
    benefitShipped?: boolean
    packageShipped?: PackageShipped

    userMatched?: boolean
}

export const members: Member[] = [
    {
        id: 1,
        firstName: 'Benjamin',
        lastName: 'Gilbert-Lif',
        email: 'benj11@me.com',
        phone: '5613254822',
        discordUsername: 'sleepy_porg',
        address1: '6189 Vista Linda Ln',
        city: 'Boca Raton',
        state: 'Florida',
        zip: '33433',
        country: 'United States',
        shirtSize: 'L',
        isMember: true,
        eligibleForBenefits: true,
        beganMembership: '2024-08-01',
        membershipAmount: 100,
        membershipTier: 'Inner Circle Member',
        numberOfContributions: 10,
        discordConfirmed: true,
        nameConfirmed: true,
        addressConfirmed: true,
        cardPrinted: true,
        labelPrinted: true,
        cardPacked: true,
        benefitShipped: true,
        packageShipped: 'Yes',
        userMatched: true,
    },
    {
        id: 2,
        firstName: 'Alex',
        lastName: 'Richter',
        email: 'alexandertherichter@gmail.com',
        phone: '9524635015',
        discordUsername: 'nopunchman',
        address1: '5796 E 280th St',
        city: 'Elko New Market',
        state: 'Minnesota',
        zip: '55020',
        country: 'United States',
        shirtSize: 'L',
        isMember: true,
        eligibleForBenefits: true,
        beganMembership: '2024-09-13',
        membershipAmount: 100,
        membershipTier: 'Inner Circle Member',
        numberOfContributions: 13,
        discordConfirmed: true,
        nameConfirmed: true,
        addressConfirmed: true,
        cardPrinted: true,
        labelPrinted: true,
        cardPacked: true,
        benefitShipped: true,
        packageShipped: 'Yes',
        userMatched: true,
    },
    {
        id: 3,
        firstName: 'Haley',
        lastName: 'Hutson',
        email: 'haleyhutson1996@gmail.com',
        phone: '8177277036',
        discordUsername: 'haleyhutson._30519',
        address1: '3121 Nutmeg Ln',
        city: 'Garland',
        state: 'Texas',
        zip: '75044',
        country: 'United States',
        isMember: false,
        eligibleForBenefits: false,
        beganMembership: '2025-10-06',
        membershipAmount: 100,
        membershipTier: 'Inner Circle Member',
        numberOfContributions: 2,
        discordConfirmed: true,
        nameConfirmed: false,
        addressConfirmed: false,
        cardPrinted: false,
        labelPrinted: false,
        cardPacked: false,
        benefitShipped: false,
        packageShipped: 'No',
        userMatched: false,
    },
    {
        id: 4,
        firstName: 'Marshall',
        lastName: 'Carter',
        email: 'Headed9hydra@gmail.com ',
        phone: '2526783567',
        discordUsername: '9headedhydra',
        address1: '7413 Pennbrook Ct.',
        city: 'Chesterfield',
        state: 'Virginia',
        zip: '23832',
        country: 'United States',
        shirtSize: 'XXL',
        isMember: true,
        eligibleForBenefits: true,
        beganMembership: '2025-09-22',
        membershipAmount: 100,
        membershipTier: 'Inner Circle Member',
        numberOfContributions: 8,
        discordConfirmed: true,
        nameConfirmed: true,
        addressConfirmed: true,
        cardPrinted: true,
        labelPrinted: true,
        cardPacked: true,
        benefitShipped: false,
        packageShipped: 'No',
        userMatched: true,
    },
    {
        id: 5,
        firstName: 'Seafoam',
        lastName: 'Handy',
        email: '10seafoam10@gmail.com',
        phone: '5189545956',
        discordUsername: 's.eafo.am',
        address1: '1 Kelly St',
        city: 'Troy',
        state: 'New York',
        zip: '12180',
        country: 'United States',
        isMember: true,
        eligibleForBenefits: true,
        beganMembership: '2025-12-27',
        membershipAmount: 10,
        membershipTier: 'Premium Member',
        numberOfContributions: 8,
        discordConfirmed: true,
        nameConfirmed: true,
        addressConfirmed: true,
        cardPrinted: false,
        labelPrinted: false,
        cardPacked: false,
        benefitShipped: false,
        packageShipped: 'No',
        userMatched: false,
    },
    {
        id: 6,
        firstName: 'Conner',
        lastName: 'Hill',
        email: 'connerhill05@icloud.com',
        phone: '4252322522',
        discordUsername: 'mxtallical',
        address1: '11509 128th dr NE',
        city: 'Lake Stevens',
        state: 'Washington',
        zip: '98258',
        country: 'United States',
        isMember: true,
        eligibleForBenefits: true,
        beganMembership: '2025-07-12',
        membershipAmount: 20,
        membershipTier: 'Signature Member',
        numberOfContributions: 5,
        discordConfirmed: true,
        nameConfirmed: true,
        addressConfirmed: false,
        cardPrinted: true,
        labelPrinted: false,
        cardPacked: false,
        benefitShipped: false,
        packageShipped: 'Not Received',
        userMatched: false,
    },
    {
        id: 7,
        firstName: 'Jayden',
        lastName: 'Stevens',
        email: 'stevens.jayden.a@gmail.com',
        phone: '7753439011',
        discordUsername: 'brewmastercraft',
        address1: '4959 Talbot Ln',
        address2: 'Apt 37',
        city: 'Reno',
        state: 'Nevada',
        zip: '89509',
        country: 'United States',
        isMember: false,
        eligibleForBenefits: true,
        beganMembership: '2025-05-11',
        membershipAmount: 20,
        membershipTier: 'Signature Member',
        numberOfContributions: 14,
        discordConfirmed: true,
        nameConfirmed: true,
        addressConfirmed: false,
        cardPrinted: true,
        labelPrinted: false,
        cardPacked: false,
        benefitShipped: false,
        packageShipped: 'Canceled',
        userMatched: false,
    },
    {
        id: 8,
        firstName: 'Riley',
        lastName: 'Pusins',
        email: 'rileypusins@gmail.com',
        phone: '8139974153',
        discordUsername: 'Riley Pusins',
        address1: '1901 Honeysuckle',
        city: 'Tallahassee',
        state: 'Florida',
        zip: '32304',
        country: 'United States',
        isMember: false,
        eligibleForBenefits: true,
        beganMembership: '2025-11-28',
        membershipAmount: 5,
        membershipTier: 'Dues Paying Member',
        numberOfContributions: 5,
        discordConfirmed: false,
        nameConfirmed: false,
        addressConfirmed: false,
        cardPrinted: false,
        labelPrinted: false,
        cardPacked: false,
        benefitShipped: false,
        packageShipped: 'No',
        userMatched: false,
    },
]
