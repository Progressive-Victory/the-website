import { zMutationRequest } from './MutationRequest.js';
import z from 'zod';

export const zActBlueDonorLinkRequest = zMutationRequest.extend({
	userId: z.number().nullable(),
});

export type ActBlueDonorLinkRequest = z.infer<typeof zActBlueDonorLinkRequest>;
