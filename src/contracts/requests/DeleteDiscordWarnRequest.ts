import z from 'zod';

export const zDeleteDiscordWarnRequest = z.object({
	warn_id: z.coerce.number(),
});

export type DeleteDiscordWarnRequest = z.infer<
	typeof zDeleteDiscordWarnRequest
>;
