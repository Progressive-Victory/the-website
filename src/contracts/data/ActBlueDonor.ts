import { zActBlueContribution } from './ActBlueContribution'
import z from 'zod'

export const zActBlueDonor = z
    .object({
        firstname: z.string(),
        lastname: z.string(),
        addr1: z.string().nullable(),
        city: z.string().nullable(),
        state: z.string().nullable(),
        zip: z.number().nullable(),
        country: z.string().nullable(),
        isEligibleForExpressLane: z.boolean(),
        employerData: z
            .object({
                employer: z.string().nullable(),
                occupation: z.string().nullable(),
                employerAddr1: z.string().nullable(),
                employerCity: z.string().nullable(),
                employerState: z.string().nullable(),
                employerZip: z.number().nullable(),
                employerCountry: z.string().nullable(),
            })
            .nullable(),
        email: z.string(),
        phone: z.string().optional(),
        userId: z.int().nullable(),
        contributions: z.array(zActBlueContribution).optional(),
    })
    .strict()

export type ActBlueDonor = z.infer<typeof zActBlueDonor>
