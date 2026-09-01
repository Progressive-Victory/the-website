import z from 'zod';

export const zUserOnboardingVerifyRequest = z.object({
	code: z.number(),
});

export type UserOnboardingVerifyRequest = z.infer<
	typeof zUserOnboardingVerifyRequest
>;
