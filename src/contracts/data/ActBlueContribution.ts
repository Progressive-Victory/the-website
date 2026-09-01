import { zActBlueContributionCustomField } from './ActBlueContributionCustomField.js';
import { zActBlueLineitem } from './ActBlueLineitem.js';
import z from 'zod';

export const zActBlueContribution = z.strictObject({
	createdAt: z.coerce.date(),
	orderNumber: z.string(),
	contributionForm: z.string(),
	refcodes: z.record(z.string(), z.string().nullish()).nullish(),
	abTestName: z.string().nullable(),
	abTestVariation: z.string().nullable(),
	isRecurring: z.boolean(),
	recurringPeriod: z.string(),
	recurringDuration: z.number().nullable(),
	weeklyRecurringSunset: z.string().nullable(),
	isPaypal: z.boolean(),
	isMobile: z.boolean(),
	isExpress: z.boolean(),
	withExpressLane: z.boolean(),
	expressSignup: z.boolean(),
	uniqueIdentifier: z.string(),
	status: z.string(),
	thanksUrl: z.string().nullish(),
	retryUrl: z.string().nullish(),
	textMessageOption: z.string(),
	giftDeclined: z.boolean().nullable(),
	giftIdentifier: z.string().nullable(),
	shippingName: z.string().nullable(),
	shippingAddr1: z.string().nullable(),
	shippingCity: z.string().nullable(),
	shippingState: z.string().nullable(),
	shippingZip: z.string().nullable(),
	shippingCountry: z.string().nullable(),
	smartBoostAmount: z.coerce.number().nullable(),
	customFields: z.array(zActBlueContributionCustomField),
	merchandise: z.array(
		z.object({
			name: z.string(),
			itemId: z.string(),
			details: z.object({
				color: z.string(),
				size: z.string(),
			}),
		})
	),
	bumpYourRecurring: z
		.object({
			bumpRecurringLink: z.string(),
			recurringUpsellSeen: z.boolean(),
			recurringUpsellAccepted: z.boolean(),
		})
		.nullable(),
	lineitems: z.array(zActBlueLineitem).optional(),
});

export type ActBlueContribution = z.infer<typeof zActBlueContribution>;
