import { zActBlueContribution } from './ActBlueContribution'
import z from 'zod'

export enum MembershipDeliverableStatus {
    NotEligible = 0,
    NotStarted = 1,
    Printed = 2,
    InTransit = 3,
    Recieved = 4,
    Returned = 5,
}

export const zMembershipDeliverableStatus = z
    .enum(MembershipDeliverableStatus)
    .default(0)

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
        membershipCardStatus: zMembershipDeliverableStatus,
        membershipMerchStatus: zMembershipDeliverableStatus,
        contributions: z.array(zActBlueContribution).optional(),
    })
    .strict()

export type ActBlueDonor = z.infer<typeof zActBlueDonor>
