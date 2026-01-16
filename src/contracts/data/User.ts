import { zDiscordUser } from './DiscordUser'
import { zLocation } from './Location'
import { zOnboardingStage } from './OnboardingStage'
import { zRole } from './Role'
import z from 'zod'

export enum UserStatus {
    Deleted = 0,
    Active = 1,
}

export const zUserStatus = z.enum(UserStatus)

export const zUser = z.object({
    id: z.int(),
    email: z.string().nullable(),
    phone: z.string().nullable(),
    preferredName: z.string().nullable(),
    firstName: z.string().nullable(),
    lastName: z.string().nullable(),
    birthdate: z.date().nullable(),
    location: zLocation.nullable(),

    acceptedAlerts: z.coerce.boolean(),
    verified: z.coerce.boolean(),
    onboardingStage: zOnboardingStage,
    lastSmsCode: z.number().nullable(),
    lastSmsCodeSendTimeUtc: z.date().nullable(),
    status: zUserStatus,

    createdAtUtc: z.date().nullable(),
    completedIntakeUtc: z.date().nullable(),
    aliases: z.array(z.string()).optional(),
    roles: z.array(zRole).optional(),
    discordUsers: z.array(zDiscordUser).optional(),
})

export type IUser = z.infer<typeof zUser>
