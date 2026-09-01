import { zPermission } from './Permission.js';
import z from 'zod';

export const zRole = z.object({
	id: z.int(),
	name: z.string(),
	permissions: z.array(zPermission).optional(),
});

export type Role = z.infer<typeof zRole>;
