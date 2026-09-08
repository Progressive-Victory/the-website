import {
    BackgroundColor,
    ElectionStatus,
    EndorsementType,
    InitiativeType,
} from '../data/index'
import z from 'zod'

// This is not meaningfully different than CreateEndorsementRequest which isn't meaningfully different than Endorsement
// So edit all three
export const zUpdateEndorsementRequest = z.object({
    name: z.string().nonempty().max(100).optional(),
    state: z.string().nonempty().max(36).optional(),
    jurisiction: z.string().nullish(),
    endorsementDate: z.coerce.date().nullish(),
    endorsementReason: z.string().nullish(),
    endorsementPublished: z.boolean().optional(),
    incumbent: z.boolean().optional(),
    handleHref: z.string().max(200).nullish(),
    handle: z.string().max(50).optional(),
    quote: z.string().nonempty().max(300).optional(),
    websiteHref: z.string().optional(),
    donateHref: z.string().nullish(),
    imgUrl: z.string().max(200).optional(),
    isPvMember: z.boolean().optional(),
    primaryElectionUtc: z.coerce.date().nullish(),
    generalElectionUtc: z.coerce.date().nullish(),
    initiativeLevel: z.enum(InitiativeType).optional(),
    endorsementLevel: z.enum(EndorsementType).optional(),
    avatarBgColor: z.enum(BackgroundColor).optional(),
    electionStatus: z.enum(ElectionStatus).optional(),
})

export type UpdateEndorsementRequest = z.infer<typeof zUpdateEndorsementRequest>
