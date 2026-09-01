import z from 'zod';

/**
 * The webhook request from ActBlue, sent whenever a user donates through them.
 *
 * "Specification": https://secure.actblue.com/docs/custom_integrations
 *
 * Since it comes from ActBlue, not all of our conventions can be followed.
 * Specifically, some fields are optional, either due to deprecation or certain
 * rules detailed in the spec.
 */
export const zActBlueRequest = z.strictObject({
	donor: z.object({
		firstname: z.string(),
		lastname: z.string(),
		addr1: z.string().nullable(),
		city: z.string().nullable(),
		state: z.string().nullable(),
		zip: z.string().nullable(),
		country: z.string().nullable(),
		isEligibleForExpressLane: z.boolean(),
		employerData: z.object({
			employer: z.string().nullable(),
			occupation: z.string().nullable(),
			employerAddr1: z.string().nullable(),
			employerCity: z.string().nullable(),
			employerState: z.string().nullable(),
			employerZip: z.string().nullable(),
			employerCountry: z.string().nullable(),
		}),
		// Donors are not required to share email/phone depending on whether we
		// manage the donation form or not and choose to let them. It is
		// unclear from the documentation if this means this should be optional
		// or not.
		//
		// When a field is omitted in actblue it is omitted from the
		// datastructure entirely this means that it returns undefined when
		// queried and thus must be optional despite our general design
		// protocols.
		email: z.string().nullable().optional(),
		phone: z.string().nullable().optional(),
	}),
	contribution: z.object({
		createdAt: z.coerce.date(),
		orderNumber: z.string(),
		contributionForm: z.string().nullable(),
		// TODO: Verify whether refcode values can be null (or if they or the
		// record itself can be omitted)
		refcodes: z.record(z.string(), z.string().nullish()).nullish(),
		creditCardExpiration: z.string().nullable(),
		// TODO: Restrict to 'once', 'weekly', or 'monthly'
		recurringPeriod: z.string(),
		// Coerce to string because it ends up as either a raw number or
		// "infinite" and the service is programmed to parse from strings
		// TODO: Use zod transform to parse directly
		recurringDuration: z.coerce.string().nullable(),
		abTestName: z.string().nullable(),
		// TODO: Parse this into a date
		weeklyRecurringSunset: z.string().nullable(),
		isPaypal: z.boolean(),
		isMobile: z.boolean(),
		abTestVariation: z.string().nullable(),
		isExpress: z.boolean(),
		withExpressLane: z.boolean(),
		expressSignup: z.boolean(),
		// TODO: Restrict to 'approved', 'declined', or 'pending'
		status: z.string(),
		// TODO: Restrict conditionality. `thanksUrl` is present only when
		// `status === 'approved'`. `retryUrl` is present only when
		// `status === 'declined'`, in addition to us having requested
		// declination notifications in ActBlue.
		thanksUrl: z.string().nullish(),
		retryUrl: z.string().nullish(),
		// TODO: Restrict to 'unknown', 'opt_in', or 'opt_out'
		textMessageOption: z.string(),
		// TODO: Can we figure out when this is omitted?
		giftDeclined: z.boolean().nullish(),
		giftIdentifier: z.string().nullable(),
		shippingName: z.string().nullable(),
		shippingAddr1: z.string().nullable(),
		shippingCity: z.string().nullable(),
		shippingState: z.string().nullable(),
		shippingZip: z.string().nullable(),
		shippingCountry: z.string().nullable(),
		smartBoostAmount: z.string().nullable(),
		customFields: z.array(
			z.object({
				label: z.string().nullable(),
				answer: z.string().nullable(),
			})
		),
		merchandise: z.array(
			z.object({
				name: z.string(),
				details: z.looseObject({}).nullable(),
				itemId: z.number(),
			})
		),
		// TODO: Is this actually nullable?
		bumpYourRecurring: z
			.object({
				bumpRecurringLink: z.string(),
				recurringUpsellSeen: z.boolean(),
				recurringUpsellAccepted: z.boolean(),
			})
			.nullable(),
	}),
	lineitems: z.array(
		z.object({
			sequence: z.number(),
			entityId: z.number(),
			fecId: z.string().nullable(),
			committeeName: z.string(),
			// TODO: Parse these as floats directly
			amount: z.coerce.string(),
			recurringAmount: z.coerce.string().nullable(),
			paidAt: z.coerce.date(),
			// Unique identifier for each individual donation
			lineitemId: z.number(),
			// TODO: Parse this as a float directly
			amountLessAbFees: z.coerce.string(),
		})
	),
	form: z.object({
		name: z.string(),
		kind: z.string(),
		ownerEmail: z.string().nullable(),
		managingEntityName: z.string().nullable(),
		managingEntityCommitteeName: z.string().nullable(),
	}),
});

export type ActBlueRequest = z.infer<typeof zActBlueRequest>;
