import z from 'zod';

export const zRedirectResponse = z.object({});

export type RedirectResponse = z.infer<typeof zRedirectResponse>;
