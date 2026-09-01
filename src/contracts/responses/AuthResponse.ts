import z from 'zod';

export const zAuthResponse = z.object({
	accessToken: z.string(),
});

export type AuthResponse = z.infer<typeof zAuthResponse>;
