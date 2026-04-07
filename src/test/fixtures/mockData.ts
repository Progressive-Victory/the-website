import { User, OnboardingStage } from '@/contracts/data'

export interface MockUser extends User {
    // Add any test-specific fields here
    testNotes?: string
}

export interface MockData {
    users: MockUser[]
    // Add other entities as needed
    // discordUsers: MockDiscordUser[]
    // settings: MockSettings[]
}

// Factory functions for generating mock data
export class MockDataFactory {
    static createUser(overrides: Partial<MockUser> = {}): MockUser {
        return {
            id: 1,
            email: null,
            phone: null,
            preferredName: null,
            firstName: 'John',
            lastName: 'Doe',
            birthdate: new Date('1990-01-01'),
            address: {
                addressLine1: '123 Main St',
                addressLine2: null,
                city: 'Anytown',
                county: null,
                state: 'CA',
                zip: '12345',
            },
            acceptedAlerts: true,
            verified: false,
            onboardingStage: OnboardingStage.NOT_STARTED,
            lastSmsCode: null,
            lastSmsCodeSendTimeUtc: null,
            status: 1, // Active
            createdAtUtc: new Date(),
            joinedAtUtc: null,
            completedIntakeUtc: null,
            membershipCardStatus: 0,
            membershipMerchStatus: 0,
            aliases: [],
            roles: [],
            discordUsers: [],
            donors: [],
            testNotes: 'Default test user',
            ...overrides,
        }
    }

    static createUserWithStage(
        stage: OnboardingStage,
        overrides: Partial<MockUser> = {}
    ): MockUser {
        return this.createUser({
            onboardingStage: stage,
            ...overrides,
        })
    }
}
