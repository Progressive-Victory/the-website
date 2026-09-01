import z from 'zod';

export const zCreatePermissionRequest = z.object({
	name: z.string().nonempty(),
});

export type CreatePermissionRequest = z.infer<typeof zCreatePermissionRequest>;
