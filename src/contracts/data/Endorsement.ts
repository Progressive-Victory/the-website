import z from 'zod'

export enum InitiativeType {
    State = 0,
    National = 1,
    None = 2,
}
export enum EndorsementType {
    PVPledge = 0,
    Endorsement = 1,
    Recommendation = 2,
    Unendorsed = 3,
    None = 4,
}
export enum BackgroundColor {
    Blue = 0,
    Yellow = 1,
    Red = 2,
}
export enum ElectionStatus {
    NoElection = 0,
    UpcomingPrimary = 1,
    WonPrimary = 2,
    Elected = 3,
    LostPrimary = 4,
    LostGeneral = 5,
    DroppedOut = 6,
}

export const zEndorsement = z.object({
    id: z.int(),
    name: z.string(),
    state: z.string(),
    jurisdiction: z.string().nullable(),
    endorsementDate: z.coerce.date().nullable(),
    endorsementReason: z.string().nullable(),
    endorsementPublished: z.boolean(),
    incumbent: z.boolean(),
    handleHref: z.string().nullable(),
    handle: z.string().nullable(),
    quote: z.string().nullable(),
    websiteHref: z.string().nullable(),
    donateHref: z.string().nullable(),
    isPvMember: z.boolean(),
    imgHref: z.string().nullable(),
    primaryElectionDate: z.coerce.date().nullable(),
    generalElectionDate: z.coerce.date().nullable(),
    initiativeLevel: z.enum(InitiativeType),
    endorsementLevel: z.enum(EndorsementType),
    avatarBgColor: z.enum(BackgroundColor),
    electionStatus: z.enum(ElectionStatus),
})

export type Endorsement = z.infer<typeof zEndorsement>
