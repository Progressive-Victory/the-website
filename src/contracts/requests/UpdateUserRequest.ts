import { zOnboardingStage, zUserStatus } from '../data'
import { zUpdateUserAddressRequest } from './UpdateUserAddressRequest'
import z from 'zod'

export const zUpdateUserRequest = z
    .object({
        email: z.string().max(100).nonempty().nullable().optional(),
        phone: z.string().max(15).nonempty().nullable().optional(),
        preferredName: z.string().max(100).nonempty().nullable().optional(),
        firstName: z.string().max(100).nonempty().nullable().optional(),
        lastName: z.string().max(100).nonempty().nullable().optional(),
        birthdate: z.coerce.date().nullable().optional(),
        address: zUpdateUserAddressRequest.optional(),

        acceptedAlerts: z.boolean().optional(),
        verified: z.boolean().optional(),
        onboardingStage: zOnboardingStage.optional(),
        lastSmsCode: z.number().nullable().optional(),
        lastSmsCodeSendTimeUtc: z.coerce.date().nullable().optional(),
        status: zUserStatus.optional(),

        joinedAtUtc: z.coerce.date().nullable().optional(),
        completedIntakeUtc: z.coerce.date().nullable().optional(),

        aliases: z.array(z.string().max(100).nonempty()).optional(),
        roles: z.array(z.number()).optional(),
    })
    .strict()

export type UpdateUserRequest = z.infer<typeof zUpdateUserRequest>
