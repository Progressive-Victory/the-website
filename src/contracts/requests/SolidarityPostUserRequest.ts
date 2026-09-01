import z from 'zod';

export const zSolidarityPostUserRequest = z.object({
	phone_number: z.string().nullable(),
	email: z.string().nullable(),
	first_name: z.string().nullable(),
	last_name: z.string().nullable(),
	preferred_language: z.string(),
	chapter_id: z.int().nullable(),
	chapter_ids: z.array(z.int().nullable()).nullable(),
	custom_user_properties: z
		.object({
			discord_id: z.string().nullable(),
		})
		.nullable(),
	address: z
		.object({
			city: z.string().nullable(),
			state: z.string().nullable(),
			zip_code: z.string().nullable(),
		})
		.nullable(),
});

export type SolidarityPostUserRequest = z.infer<
	typeof zSolidarityPostUserRequest
>;
