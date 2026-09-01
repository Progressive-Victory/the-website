import z from 'zod';

export const zDiscordUserIsInServerResponse = z.object({
	isInServer: z.boolean(),
});

export type DiscordUserIsInServerResponse = z.infer<
	typeof zDiscordUserIsInServerResponse
>;
