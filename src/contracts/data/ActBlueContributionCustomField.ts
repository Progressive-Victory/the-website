import z from 'zod';

export const zActBlueContributionCustomField = z.object({
	id: z.number().optional(),
	label: z.string(),
	answer: z.string(),
});

export type ActBlueContributionCustomField = z.infer<
	typeof zActBlueContributionCustomField
>;
