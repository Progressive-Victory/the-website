import z from 'zod';

export const zCreateDiscordSkillTeamRoleRequest = z.object({
	teamRoleId: z.string().nonempty(),
	teamName: z.string().nonempty(),
	leadRoleId: z.string().nonempty(),
	teamChannelId: z.string().nonempty(),
});

export type ICreateDiscordSkillTeamRoleRequest = z.infer<
	typeof zCreateDiscordSkillTeamRoleRequest
>;
