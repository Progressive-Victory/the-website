import { zMutationRequest } from './MutationRequest.js';
import z from 'zod';

export const zCreateDiscordUserRequest = zMutationRequest.extend({
	discordId: z.string().nonempty(),
	discordUsername: z.string().nonempty(),
	discordImage: z.string().nonempty(),
	userId: z.coerce.number(),
	email: z.string().nonempty(),
});

export type CreateDiscordUserRequest = z.infer<
	typeof zCreateDiscordUserRequest
>;
