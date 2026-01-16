import z from 'zod'

export const zUserOnboardingJoinRequest = z.object({
    discordUserId: z.string(),
})

export type UserOnboardingJoinRequest = z.infer<
    typeof zUserOnboardingJoinRequest
>
