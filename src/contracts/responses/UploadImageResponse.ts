import z from 'zod';

export const zUploadImageResponse = z.object({
	url: z.url().max(200),
});

export type UploadImageResponse = z.infer<typeof zUploadImageResponse>;
