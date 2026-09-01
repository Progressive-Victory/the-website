import z from 'zod';

export const zLocation = z.object({
	zip: z.int(),
	city: z.string(),
	county: z.string(),
	state: z.string(),
});

export type Location = z.infer<typeof zLocation>;
