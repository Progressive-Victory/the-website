import z from 'zod'

export const zCreateUserRequest = z.object({
    email: z.string(),
})

export type CreateUserRequest = z.infer<typeof zCreateUserRequest>
