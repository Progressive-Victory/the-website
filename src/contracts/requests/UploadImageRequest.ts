import { type MultipartFile } from '@fastify/multipart';
import z from 'zod';

export const zUploadImageRequest = z.object({
	image: z.custom<MultipartFile>(
		(val) => {
			if (!val || typeof val !== 'object') return false;
			return 'file' in val && 'filename' in val && 'mimetype' in val;
		},
		{
			message: 'Input must be a valid multipart file',
		}
	),
});

export type UploadImageRequest = z.infer<typeof zUploadImageRequest>;
