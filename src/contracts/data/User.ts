import { zDiscordUser } from './DiscordUser'
import { zLocation } from './Location'
import { zOnboardingStage } from './OnboardingStage'
import { zRole } from './Role'
import { zUpdateHistory } from './UpdateHistory'
import z from 'zod'

export enum UserStatus {
    Deleted = 0,
    Active = 1,
}

export const zUserStatus = z.enum(UserStatus)

const zBaseUser = z.object({
    id: z.int(),
    email: z.string().nullable(),
    phone: z.string().nullable(),
    preferredName: z.string().nullable(),
    firstName: z.string().nullable(),
    lastName: z.string().nullable(),
    birthdate: z.coerce.date().nullable(),
    location: zLocation.nullable(),

    acceptedAlerts: z.boolean(),
    verified: z.boolean(),
    onboardingStage: zOnboardingStage,
    lastSmsCode: z.number().nullable(),
    lastSmsCodeSendTimeUtc: z.coerce.date().nullable(),
    status: zUserStatus,

    createdAtUtc: z.coerce.date().nullable(),
    joinedAtUtc: z.coerce.date().nullable(),
    completedIntakeUtc: z.coerce.date().nullable(),

    aliases: z.array(z.string()).optional(),
    roles: z.array(zRole).optional(),
    discordUsers: z.array(zDiscordUser).optional(),
})

export const zUser = zBaseUser.extend({
    history: z.array(zUpdateHistory(zBaseUser)).optional(),
})

export type User = z.infer<typeof zUser>
