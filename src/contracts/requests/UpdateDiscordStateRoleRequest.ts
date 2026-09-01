import z from 'zod';

export const zUpdateDiscordStateRoleRequest = z.object({
	stateName: z.string().nonempty().optional(),
	memberRoleId: z.string().nonempty().optional(),
	memberChannelId: z.string().nonempty().optional(),
	teamRoleId: z.string().nonempty().optional(),
	teamChannelId: z.string().nonempty().optional(),
});

export type IUpdateDiscordStateRoleRequest = z.infer<
	typeof zUpdateDiscordStateRoleRequest
>;
