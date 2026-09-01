import z from 'zod';

export const zPosition = z.object({
	id: z.int(),
	name: z.string(),
	childIds: z.array(z.int()),
	userIds: z.array(z.int()),
});

export type Position = z.infer<typeof zPosition>;
