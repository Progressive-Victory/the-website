import { zOnboardingStage, zUserStatus } from '@/contracts/data'
import z from 'zod'

export const zUpdateUserRequest = z
    .object({
        email: z.string().nullable().optional(),
        phone: z.string().nullable().optional(),
        preferredName: z.string().nullable().optional(),
        firstName: z.string().nullable().optional(),
        lastName: z.string().nullable().optional(),
        birthdate: z.coerce.date().nullable().optional(),
        zipCode: z.number().nullable().optional(),

        acceptedAlerts: z.boolean().optional(),
        verified: z.boolean().optional(),
        onboardingStage: zOnboardingStage.optional(),
        lastSmsCode: z.number().nullable().optional(),
        lastSmsCodeSendTimeUtc: z.coerce.date().nullable().optional(),
        status: zUserStatus.optional(),

        joinedAtUtc: z.coerce.date().nullable().optional(),
        completedIntakeUtc: z.coerce.date().nullable().optional(),

        aliases: z.array(z.string()).optional(),
        roles: z.array(z.number()).optional(),
    })
    .strict()

export type UpdateUserRequest = z.infer<typeof zUpdateUserRequest>
