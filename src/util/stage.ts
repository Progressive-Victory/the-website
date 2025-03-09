// State management enum for join flow
export enum OnboardingStage {
    NOT_STARTED = 'not_started',
    AWAIT_VERIFICATION = 'awaiting_verify',
    VERIFIED = 'verified',
    JOINED = 'joined',
}
