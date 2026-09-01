import z from 'zod';

export const zCreateNdaFormRequest = z.object({
	preferredFirstName: z.string(),
	preferredLastName: z.string(),
	legalFirstName: z.string(),
	legalLastName: z.string(),
	addressLine1: z.string(),
	addressLine2: z.string().nullable(),
	city: z.string(),
	state: z.string(),
	zipcode: z.string(),
	dateOfBirth: z.coerce.date(),
	signedStatus: z.boolean(),
	dateSigned: z.coerce.date().nullable(),
});

export type CreateNdaFormRequest = z.infer<typeof zCreateNdaFormRequest>;
