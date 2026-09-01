import z from 'zod';

export const zMetaData = z.object({
	userWhoUpdatedId: z.number().optional(),
	dataSource: z.string().optional(),
});

export type MetaData = z.infer<typeof zMetaData>;
