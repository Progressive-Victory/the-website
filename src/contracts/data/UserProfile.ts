import { zDiscordUser } from './DiscordUser.js';
import z from 'zod';

export const zUserProfile = z.object({
	id: z.number(),
	email: z.string().nullable(),
	preferredName: z.string().nullable(),
	firstName: z.string().nullable(),
	lastName: z.string().nullable(),
	aliases: z.array(z.string()),
	discordUsers: z.array(zDiscordUser),
});

export type UserProfile = z.infer<typeof zUserProfile>;
