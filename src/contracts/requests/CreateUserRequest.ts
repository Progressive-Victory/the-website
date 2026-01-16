import { zOnboardingStage } from '@/models/users'
import z from 'zod'

export const zCreateUserRequest = z.object({
    email: z.string(),
    name: z.string().nullable(),
    firstName: z.string().nullable(),
    lastName: z.string().nullable(),
    preferredName: z.string().optional().nullable(),
    dateOfBirth: z.coerce.date().nullable(),
    zipCode: z.coerce.number().nullable(),
    state: z.string().nullable(),
    county: z.string().nullable(),
    city: z.string().nullable(),
    phoneNumber: z.string().nullable(),
    verified: z.coerce.boolean().nullable(),
    acceptedAlerts: z.coerce.boolean().nullable(),
    onboardingStage: zOnboardingStage.nullable(),
    joinedAtUtc: z.coerce.date().nullable(),
    completedIntakeUtc: z.coerce.date().nullable(),
    lastSmsCode: z.coerce.number().nullable(),
    lastSmsCodeSendTimeUtc: z.coerce.date().nullable(),
    status: z.coerce.number().nullable(),
    roles: z.array(z.coerce.number()).nullable(),
})

export type ICreateUserRequest = z.infer<typeof zCreateUserRequest>
