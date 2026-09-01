import { zActBlueContribution } from './ActBlueContribution.js';
import z from 'zod';

export const zActBlueForm = z
	.object({
		name: z.string(),
		kind: z.string(),
		contributions: z.array(zActBlueContribution).optional(),
	})
	.strict();

export type ActBlueForm = z.infer<typeof zActBlueForm>;
