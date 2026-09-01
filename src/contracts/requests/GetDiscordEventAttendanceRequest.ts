import z from 'zod';

export const zGetDiscordEventAttendanceRequest = z.object({
	event_id: z.coerce.number(),
});

export type GetDiscordEventAttendanceRequest = z.infer<
	typeof zGetDiscordEventAttendanceRequest
>;
