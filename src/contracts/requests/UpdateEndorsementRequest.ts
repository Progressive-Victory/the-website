import {
	BackgroundColor,
	ElectionStatus,
	EndorsementType,
	InitiativeType,
} from '../data/index.js';
import z from 'zod';

// This is not meaningfully different than CreateEndorsementRequest which isn't meaningfully different than Endorsement
// So edit all three
export const zUpdateEndorsementRequest = z.object({
	name: z.string().nonempty().max(100).optional(),
	state: z.string().nonempty().max(36).optional(),
	description: z.string().nonempty().max(300).optional(),
	candidateLink: z.string().max(200).optional(),
	linkLabel: z.string().max(50).optional(),
	imgUrl: z.string().max(200).optional(),
	isStateInitiative: z.boolean().optional(),
	isNationalInitiative: z.boolean().optional(),
	isPvMember: z.boolean().optional(),
	tookPvPledge: z.boolean().optional(),
	primaryElection: z.coerce.date().optional().nullable(),
	generalElection: z.coerce.date().optional().nullable(),
	initiativeLevel: z.enum(InitiativeType).optional(),
	endorsementLevel: z.enum(EndorsementType).optional(),
	avatarBgColor: z.enum(BackgroundColor).optional(),
	electionStatus: z.enum(ElectionStatus).optional(),
});

export type UpdateEndorsementRequest = z.infer<
	typeof zUpdateEndorsementRequest
>;
