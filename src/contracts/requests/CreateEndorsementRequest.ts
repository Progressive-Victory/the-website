import {
    BackgroundColor,
    ElectionStatus,
    EndorsementType,
    InitiativeType,
} from '../data/index'
import z from 'zod'

export const zCreateEndorsementRequest = z.object({
    name: z.string().nonempty().max(100),
    state: z.string().nonempty().max(36),
    jurisdiction: z.string().nullable(),
    endorsementDate: z.coerce.date().nullable(),
    endorsementReason: z.string().nullable(),
    endorsementPublished: z.boolean(),
    incumbent: z.boolean(),
    handleHref: z.string().max(200).nullable(),
    handle: z.string().max(50),
    quote: z.string().nonempty().max(300),
    websiteHref: z.string(),
    donateHref: z.string().nullable(),
    imgUrl: z.string().max(200),
    isPvMember: z.boolean(),
    primaryElectionDate: z.coerce.date().nullable(),
    generalElectionDate: z.coerce.date().nullable(),
    initiativeLevel: z.enum(InitiativeType),
    endorsementLevel: z.enum(EndorsementType),
    avatarBgColor: z.enum(BackgroundColor),
    electionStatus: z.enum(ElectionStatus),
})

export type CreateEndorsementRequest = z.infer<typeof zCreateEndorsementRequest>
