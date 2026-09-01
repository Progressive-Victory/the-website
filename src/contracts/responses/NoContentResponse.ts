import z from 'zod';

export const zNoContentResponse = z.object({});

export type NoContentResponse = z.infer<typeof zNoContentResponse>;
