import { zNdaForm } from '../data/index.js';
import z from 'zod';

export const zNdaFormsResponse = z.object({
	forms: z.array(zNdaForm),
});

export type NdaFormsResponse = z.infer<typeof zNdaFormsResponse>;
