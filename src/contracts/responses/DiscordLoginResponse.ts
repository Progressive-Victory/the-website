import z from 'zod';

export const zDiscordLoginResponse = z.object({ redirectUri: z.string() });

export type DiscordLoginResponse = z.infer<typeof zDiscordLoginResponse>;
