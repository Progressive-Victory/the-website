import { zActBlueContributionCustomField } from './ActBlueContributionCustomField.js';
import z from 'zod';

export const zActBlueDonationPacket = z.object({
	sequence: z.number(),
	amount: z.number(),
	recurringAmount: z.number().nullable(),
	paidAt: z.coerce.date(),
	lineitemId: z.number(),
	amountLessAbFees: z.number(),
	contributionForm: z.string(),
	orderNumber: z.string(),
	isRecurring: z.boolean(),
	isPaypal: z.boolean(),
	isMobile: z.boolean(),
	isExpress: z.boolean(),
	recurringPeriod: z.string(),
	recurringDuration: z.number().nullable(),
	firstName: z.string(),
	lastName: z.string(),
	state: z.string().nullable(),
	email: z.string(),
	kind: z.string(),
	customFields: z.array(zActBlueContributionCustomField).optional(),
});

export type ActBlueDonationPacket = z.infer<typeof zActBlueDonationPacket>;
