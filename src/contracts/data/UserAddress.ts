import z from 'zod';

export const zUserAddress = z.object({
	addressLine1: z.string().nullable(),
	addressLine2: z.string().nullable(),
	city: z.string().nullable(),
	county: z.string().nullable(),
	state: z.string().nullable(),
	zip: z.string().nullable(),
});

export type UserAddress = z.infer<typeof zUserAddress>;
