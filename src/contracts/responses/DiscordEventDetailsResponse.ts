import { zDiscordEvent, zDiscordUser } from '../data/index.js';
import z from 'zod';

export const zDiscordEventDetailsResponse = z.object({
	event: zDiscordEvent,
	createdBy: zDiscordUser,
});
export type DiscordEventDetailsResponse = z.infer<
	typeof zDiscordEventDetailsResponse
>;
