import z from 'zod'

export const zUserOnboardingCollectInfoRequest = z.object({
    firstName: z.string(),
    lastName: z.string(),
    phone: z.string(),
    zipCode: z.number(),
    birthdate: z.coerce.date(),
    acceptedAlerts: z.boolean(),
})

export type UserOnboardingCollectInfoRequest = z.infer<
    typeof zUserOnboardingCollectInfoRequest
>
