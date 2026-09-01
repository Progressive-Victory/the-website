import z from 'zod';

// State management enum for join flow
export enum OnboardingStage {
	// The user has logged in but hasn't begun onboarding yet
	NOT_STARTED = 'not_started',

	// Onboarding form has been submitted, but no SMS code has been entered.
	AWAITING_VERIFY = 'awaiting_verify',

	// SMS code has been verified and the user is being joined to the server.
	VERIFIED = 'verified',

	// The user is under 18 and isn't allowed to join the server.
	UNDERAGE = 'underage',

	// The user is neither a US citizen nor resident and isn't allowed to join the server.
	NOT_CITIZEN = 'not_citizen',

	// The user has joined the server successfully.
	JOINED = 'joined',

	// The user was banned.
	BANNED = 'banned',
}

export const zOnboardingStage = z.enum(OnboardingStage);
