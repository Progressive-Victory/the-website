import z from 'zod';

export enum InitiativeType {
	State,
	National,
}
export enum EndorsementType {
	PVPledge,
	Endorsement,
	Recommendation,
}
export enum BackgroundColor {
	Blue,
	Yellow,
}
export enum ElectionStatus {
	NoElection,
	UpcomingPrimary,
	WonPrimary,
	Elected,
	LostPrimary,
	LostGeneral,
	DroppedOut,
}

export const zEndorsement = z.object({
	id: z.int(),
	name: z.string(),
	state: z.string(),
	candidateLink: z.string(),
	linkLabel: z.string(),
	description: z.string(),
	isStateInitiative: z.coerce.boolean(),
	isNationalInitiative: z.coerce.boolean(),
	isPvMember: z.coerce.boolean(),
	tookPvPledge: z.coerce.boolean(),
	imgUrl: z.string(),
	primaryElection: z.coerce.date().nullable(),
	generalElection: z.coerce.date().nullable(),
	initiativeLevel: z.enum(InitiativeType),
	endorsementLevel: z.enum(EndorsementType),
	avatarBgColor: z.enum(BackgroundColor),
	electionStatus: z.enum(ElectionStatus),
});

export type Endorsement = z.infer<typeof zEndorsement>;
