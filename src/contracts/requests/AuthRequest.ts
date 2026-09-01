import z from 'zod';

export const zAuthRequest = z.object({ discordToken: z.string() });

export type AuthRequest = z.infer<typeof zAuthRequest>;
