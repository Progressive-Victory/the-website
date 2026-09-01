import z from 'zod';

export const zDiscordUser = z.object({
	id: z.string(),
	username: z.string(),
	image: z.string(),
	userId: z.number().nullable(),
	email: z.string().nullable(),
});

export type DiscordUser = z.infer<typeof zDiscordUser>;
