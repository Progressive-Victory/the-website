import { zLocation, zRole } from './models'
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
    lastSmsCode: z.string().nullable(),
    lastSmsCodeSendTimeUtc: z.coerce.date().nullable(),
    status: zUserStatus,

    createdAtUtc: z.coerce.date().nullable(),
    completedIntakeUtc: z.coerce.date().nullable(),
    aliases: z.array(z.string()).optional(),
    roles: z.array(zRole).optional(),
})

export type User = z.infer<typeof zUser>

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
