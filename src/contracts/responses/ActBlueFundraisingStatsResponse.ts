import z from 'zod';

export const zActBlueFundraisingStatsResponse = z.object({
	totalDollarsRaised: z.number(),
	oneTimeDollarsRaised: z.number(),
	recurringDollarsRaised: z.number(),
	totalContributionCount: z.number(),
	oneTimeContributionCount: z.number(),
	recurringContributionCount: z.number(),
	totalDonorCount: z.number(),
	oneTimeDonorCount: z.number(),
	recurringDonorCount: z.number(),
	avgContributionAmount: z.coerce.number(),
});

export type ActBlueFundraisingStatsResponse = z.infer<
	typeof zActBlueFundraisingStatsResponse
>;
