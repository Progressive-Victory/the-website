import { User } from '@/contracts/data'

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
    static createUser(
        baseUser: MockUser,
        overrides: Partial<MockUser> = {}
    ): MockUser {
        return {
            ...baseUser,
            ...overrides,
        }
    }
}
