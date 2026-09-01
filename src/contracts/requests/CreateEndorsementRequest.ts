import {
	BackgroundColor,
	ElectionStatus,
	EndorsementType,
	InitiativeType,
} from '../data/index.js';
import z from 'zod';

export const zCreateEndorsementRequest = z.object({
	name: z.string().nonempty().max(100),
	state: z.string().nonempty().max(36),
	candidateLink: z.string().max(200),
	linkLabel: z.string().max(50),
	description: z.string().nonempty().max(300),
	isStateInitiative: z.boolean(),
	isNationalInitiative: z.boolean(),
	isPvMember: z.boolean(),
	tookPvPledge: z.boolean(),
	imgUrl: z.string().max(200),
	primaryElection: z.coerce.date().nullable(),
	generalElection: z.coerce.date().nullable(),
	initiativeLevel: z.enum(InitiativeType),
	endorsementLevel: z.enum(EndorsementType),
	avatarBgColor: z.enum(BackgroundColor),
	electionStatus: z.enum(ElectionStatus),
});

export type CreateEndorsementRequest = z.infer<
	typeof zCreateEndorsementRequest
>;
