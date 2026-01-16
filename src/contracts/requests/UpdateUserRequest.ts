import { zOnboardingStage } from '@/contracts/data'
import z from 'zod'

export const zUpdateUserRequest = z
    .object({
        name: z.string().optional(),
        email: z.string().optional(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        preferredName: z.string().optional().nullable(),
        dateOfBirth: z.coerce.date().optional(),

        zipCode: z.coerce.number().optional(),
        state: z.string().optional(),
        county: z.string().optional(),
        city: z.string().optional(),

        phoneNumber: z.string().optional(),

        verified: z.coerce.boolean().optional(),
        acceptedAlerts: z.coerce.boolean().optional(),
        onboardingStage: zOnboardingStage.optional(),

        joinedAtUtc: z.coerce.date().optional(),
        completedIntakeUtc: z.coerce.date().optional(),

        lastSmsCode: z.coerce.number().optional(),
        lastSmsCodeSendTimeUtc: z.coerce.date().optional(),
        status: z.coerce.number().optional(),

        roles: z.array(z.coerce.number()).optional(),
    })
    .strict()

export type IUpdateUserRequest = z.infer<typeof zUpdateUserRequest>
