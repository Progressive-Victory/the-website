import { zActBlueDonor } from './ActBlueDonor.js';
import { zDiscordUser } from './DiscordUser.js';
import { zLocation } from './Location.js';
import {
	zMembershipDeliverableStatus,
	zMembershipFulfillmentStatus,
	zShirtSize,
} from './Membership.js';
import { zOnboardingStage } from './OnboardingStage.js';
import { zRole } from './Role.js';
import { zUpdateHistory } from './UpdateHistory.js';
import { zUserAddress } from './UserAddress.js';
import z from 'zod';

export enum UserStatus {
	Deleted = 0,
	Active = 1,
}

export const zUserStatus = z.enum(UserStatus);

const zBaseUser = z.object({
	id: z.int(),
	email: z.string().nullable(),
	phone: z.string().nullable(),
	preferredName: z.string().nullable(),
	firstName: z.string().nullable(),
	lastName: z.string().nullable(),
	birthdate: z.coerce.date().nullable(),
	location: zLocation.nullable(),
	address: zUserAddress,

	acceptedAlerts: z.boolean(),
	verified: z.boolean(),
	onboardingStage: zOnboardingStage,
	lastSmsCode: z.number().nullable(),
	lastSmsCodeSendTimeUtc: z.coerce.date().nullable(),
	status: zUserStatus,

	createdAtUtc: z.coerce.date().nullable(),
	joinedAtUtc: z.coerce.date().nullable(),
	completedIntakeUtc: z.coerce.date().nullable(),

	/**
	 * @deprecated
	 */
	membershipCardStatus: zMembershipDeliverableStatus.default(0),
	/**
	 * @deprecated
	 */
	membershipMerchStatus: zMembershipDeliverableStatus.default(0),
	/**
	 * @deprecated
	 */
	shirtSize: zShirtSize.nullable(),
	duesPayingMember: z.boolean(),
	/**
	 * @deprecated
	 */
	membershipFulfillmentStatus: zMembershipFulfillmentStatus.nullable(),
	/**
	 * @deprecated
	 */
	nameConfirmed: z.boolean(),
	/**
	 * @deprecated
	 */
	addressConfirmed: z.boolean(),
	/**
	 * @deprecated
	 */
	membershipBenefitEligible: z.boolean(),

	aliases: z.array(z.string()).optional(),
	roles: z.array(zRole).optional(),
	discordUsers: z.array(zDiscordUser).optional(),
	donors: z.array(zActBlueDonor).optional(),
});

export const zUser = zBaseUser.extend({
	history: z.array(zUpdateHistory(zBaseUser)).optional(),
	donorHistory: z.array(zUpdateHistory(zActBlueDonor)).optional(),
});

export type User = z.infer<typeof zUser>;
