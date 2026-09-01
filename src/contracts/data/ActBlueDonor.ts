import { zActBlueContribution } from './ActBlueContribution.js';
import { zMembership } from './Membership.js';
import z from 'zod';

export const zActBlueDonor = z.object({
	firstname: z.string(),
	lastname: z.string(),
	addr1: z.string().nullable(),
	city: z.string().nullable(),
	state: z.string().nullable(),
	zip: z.string().nullable(),
	country: z.string().nullable(),
	isEligibleForExpressLane: z.boolean(),
	employerData: z
		.object({
			employer: z.string().nullable(),
			occupation: z.string().nullable(),
			employerAddr1: z.string().nullable(),
			employerCity: z.string().nullable(),
			employerState: z.string().nullable(),
			employerZip: z.string().nullable(),
			employerCountry: z.string().nullable(),
		})
		.nullable(),
	email: z.string(),
	phone: z.string().nullable(),
	userId: z.number().optional(),
	contributions: z.array(zActBlueContribution).optional(),
	
	membershipData: zMembership.optional(),
});

export type ActBlueDonor = z.infer<typeof zActBlueDonor>;
