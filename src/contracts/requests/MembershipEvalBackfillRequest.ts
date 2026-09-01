import z from 'zod';

export const zMembershipEvalBackfillRequest = z.object({
	startDate: z.coerce.date().nullable(),
	endDate: z.coerce.date().nullable(),
});

export type MembershipEvalBackfillRequest = z.infer<
	typeof zMembershipEvalBackfillRequest
>;
