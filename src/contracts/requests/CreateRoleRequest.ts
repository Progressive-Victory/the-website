import z from 'zod';

export const zCreateRoleRequest = z.object({
	name: z.string().nonempty(),
	permissionIds: z.array(z.int()),
});

export type CreateRoleRequest = z.infer<typeof zCreateRoleRequest>;
