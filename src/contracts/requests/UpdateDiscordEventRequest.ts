import { zDiscordEventStatus } from '../data/index.js';
import z from 'zod';

export const zUpdateDiscordEventRequest = z.object({
	channelId: z.string().nonempty().optional(),
	name: z.string().nonempty().optional(),
	description: z.string().nullable().optional(),
	status: zDiscordEventStatus.nullable().optional(),
	userCount: z.number().nullable().optional(),
	thumbnailUrl: z.string().nonempty().nullable().optional(),
	scheduledStartUtc: z.coerce.date().optional(),
	startedAtUtc: z.coerce.date().nullable().optional(),
	scheduledEndUtc: z.coerce.date().nullable().optional(),
	endedAtUtc: z.coerce.date().nullable().optional(),
});

export type UpdateDiscordEventRequest = z.infer<
	typeof zUpdateDiscordEventRequest
>;
