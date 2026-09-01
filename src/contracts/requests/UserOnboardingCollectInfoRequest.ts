import { zMutationRequest } from './MutationRequest.js';
import z from 'zod';

export const zUserOnboardingCollectInfoRequest = zMutationRequest.extend({
	firstName: z.string(),
	lastName: z.string(),
	phone: z.string(),
	zipCode: z.number(),
	birthdate: z.coerce.date(),
	acceptedAlerts: z.boolean(),
	usCitizen: z.boolean(),
});

export type UserOnboardingCollectInfoRequest = z.infer<
	typeof zUserOnboardingCollectInfoRequest
>;
