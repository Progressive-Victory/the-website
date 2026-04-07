import { MockUser, MockData, MockDataFactory } from './mockData'
import usersData from './users.json'
import { OnboardingStage } from '@/contracts/data'

/**
 * Service for managing mock data across tests
 * Provides both static fixtures and dynamic factory-generated data
 */
export class MockDataService {
    private static instance: MockDataService
    private mockData: MockData

    private constructor() {
        // Load static fixtures
        this.mockData = {
            users: usersData.users.map((user) => ({
                ...user,
                birthdate: user.birthdate ? new Date(user.birthdate) : null,
                createdAtUtc: user.createdAtUtc
                    ? new Date(user.createdAtUtc)
                    : null,
                joinedAtUtc: user.joinedAtUtc
                    ? new Date(user.joinedAtUtc)
                    : null,
                completedIntakeUtc: user.completedIntakeUtc
                    ? new Date(user.completedIntakeUtc)
                    : null,
                onboardingStage: user.onboardingStage as OnboardingStage,
            })),
        }
    }

    static getInstance(): MockDataService {
        if (!MockDataService.instance) {
            MockDataService.instance = new MockDataService()
        }
        return MockDataService.instance
    }

    // Get all users
    getUsers(): MockUser[] {
        return this.mockData.users
    }

    // Get user by ID
    getUserById(id: number): MockUser | undefined {
        return this.mockData.users.find((user) => user.id === id)
    }

    // Get users by onboarding stage
    getUsersByStage(stage: string): MockUser[] {
        return this.mockData.users.filter(
            (user) => user.onboardingStage === stage
        )
    }

    // Create a new user dynamically
    createUser(overrides: Partial<MockUser> = {}): MockUser {
        return MockDataFactory.createUser(overrides)
    }

    // Create user with specific stage
    createUserWithStage(
        stage: OnboardingStage,
        overrides: Partial<MockUser> = {}
    ): MockUser {
        return MockDataFactory.createUserWithStage(stage, overrides)
    }

    // Add a user to the mock database
    addUser(user: MockUser): void {
        // Ensure unique ID
        const maxId = Math.max(...this.mockData.users.map((u) => u.id), 0)
        user.id = maxId + 1
        this.mockData.users.push(user)
    }

    // Reset to original fixture data
    reset(): void {
        this.mockData = {
            users: usersData.users.map((user) => ({
                ...user,
                birthdate: user.birthdate ? new Date(user.birthdate) : null,
                createdAtUtc: user.createdAtUtc
                    ? new Date(user.createdAtUtc)
                    : null,
                joinedAtUtc: user.joinedAtUtc
                    ? new Date(user.joinedAtUtc)
                    : null,
                completedIntakeUtc: user.completedIntakeUtc
                    ? new Date(user.completedIntakeUtc)
                    : null,
                onboardingStage: user.onboardingStage as OnboardingStage,
            })),
        }
    }
}

// Export singleton instance
export const mockDataService = MockDataService.getInstance()
