import { zLocation } from './locations'
import { zRole } from './roles'
import z from 'zod'

export enum OnboardingStage {
    NOT_STARTED = 'not_started',
    AWAITING_VERIFY = 'awaiting_verify',
    VERIFIED = 'verified',
    UNDERAGE = 'underage',
    JOINED = 'joined',
}
export const zOnboardingStage = z.enum(OnboardingStage)

export enum UserStatus {
    Deleted = 0,
    Active = 1,
}

export const zUserStatus = z.enum(UserStatus)

export const zDiscordUser = z.object({
    id: z.string(),
    username: z.string(),
    image: z.string(),
})

export type IDiscordUser = z.infer<typeof zDiscordUser>

export const zUser = z.object({
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
    lastSmsCode: z.int().nullable(),
    lastSmsCodeSendTimeUtc: z.coerce.date().nullable(),
    status: zUserStatus,

    createdAtUtc: z.coerce.date().nullable(),
    completedIntakeUtc: z.coerce.date().nullable(),
    aliases: z.array(z.string()).optional(),
    roles: z.array(zRole).optional(),
    discordUsers: z.array(zDiscordUser).optional(),
})

export type IUser = z.infer<typeof zUser>

export interface UpdateUserRequest {
    name?: string
    email?: string
    firstName?: string
    lastName?: string
    preferredName?: string | null
    dateOfBirth?: string

    zipCode?: string
    state?: string
    county?: string
    city?: string

    phoneNumber?: string
    acceptedAlerts?: boolean

    verified?: boolean
    onboardingStage?: OnboardingStage

    roles?: string[]
}

export const zUserOnboardingCollectInfoRequest = z.object({
    firstName: z.string(),
    lastName: z.string(),
    phoneNumber: z.string(),
    zipCode: z.number(),
    dateOfBirth: z.coerce.date(),
    acceptedAlerts: z.boolean(),
})

export type UserOnboardingCollectInfoRequest = z.infer<
    typeof zUserOnboardingCollectInfoRequest
>

export const zUserOnboardingJoinRequest = z.object({
    discordUserId: z.string(),
})

export type UserOnboardingJoinRequest = z.infer<
    typeof zUserOnboardingJoinRequest
>

export const zUserOnboardingVerifyRequest = z.object({
    code: z.number(),
})

export type UserOnboardingVerifyRequest = z.infer<
    typeof zUserOnboardingVerifyRequest
>
