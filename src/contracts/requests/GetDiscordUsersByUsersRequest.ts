import z from 'zod';

export const zGetDiscordUsersByUsersRequest = z.array(z.coerce.number());

export type GetDiscordUsersByUsersRequest = z.infer<
	typeof zGetDiscordUsersByUsersRequest
>;
