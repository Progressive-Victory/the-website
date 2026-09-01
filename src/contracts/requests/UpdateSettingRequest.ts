import z from 'zod';

export const zUpdateSettingRequest = z.object({
	value: z.string().max(100).nonempty(),
});

export type UpdateSettingRequest = z.infer<typeof zUpdateSettingRequest>;
