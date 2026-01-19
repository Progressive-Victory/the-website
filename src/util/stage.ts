// State management enum for join flow
export enum OnboardingStage {
    NOT_STARTED = 'not_started',

    // Onboarding form has been submitted, but no SMS code has been entered.
    AWAITING_VERIFY = 'awaiting_verify',

    // SMS code has been verified and the user is being joined to the server.
    VERIFIED = 'verified',

    // The user is under 18 and isn't allowed to join the server.
    UNDERAGE = 'underage',

    // The user has joined the server successfully.
    JOINED = 'joined',
}
