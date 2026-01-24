import z from 'zod'

export const zUserOnboardingJoinRequest = z.object({
    discordToken: z.string(),
})

export type UserOnboardingJoinRequest = z.infer<
    typeof zUserOnboardingJoinRequest
>
