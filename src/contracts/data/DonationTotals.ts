import z from 'zod';

export enum TotalType {
	RECURRING = 'recurring',
	ONE_TIME = 'one_time',
	ALL = 'all',
}

export const zTotalType = z.enum(TotalType);

export const zDonationTotal = z.object({
	totalType: zTotalType,
	total: z.number(),
});

export type DonationTotal = z.infer<typeof zDonationTotal>;
