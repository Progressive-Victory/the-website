import z from 'zod';

export const zActBlueLineitem = z
	.object({
		sequence: z.number(),
		amount: z.number(),
		recurringAmount: z.number().nullable(),
		paidAt: z.coerce.date(),
		lineitemId: z.number(), // unique identifier for each individual donation
		amountLessAbFees: z.number(),
	})
	.strict();

export type ActBlueLineitem = z.infer<typeof zActBlueLineitem>;
