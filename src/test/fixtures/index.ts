import usersData from './users.json'
import { zUser } from '@/contracts/data'
import { MockUser, MockData, MockDataFactory } from '@/test/fixtures/mockData'

/**
 * Service for managing mock data across tests
 * Provides both static fixtures and dynamic factory-generated data
 */
export class MockDataService {
    private static instance: MockDataService
    private mockData: MockData

    public static DEFAULT_USER_ID = 1
    public static VERIFIED_USER_ID = 1
    public static NEW_USER_ID = 2

    private constructor() {
        // Load static fixtures
        this.mockData = this.loadFixtures()
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
    getUserById(id: number): MockUser {
        const user = this.mockData.users.find((user) => user.id === id)
        if (!user) {
            throw new Error(`User with ID ${id} not found`)
        }
        return user
    }

    // Create a new user dynamically
    createUser(overrides: Partial<MockUser> = {}, id = 1): MockUser {
        return MockDataFactory.createUser(this.getUserById(id), overrides)
    }

    // Add a user to the mock database
    addUser(user: MockUser): void {
        if (this.mockData.users.some((u) => u.id === user.id)) {
            throw new Error(`User with ID ${user.id} already exists`)
        }
        this.mockData.users.push(user)
    }

    loadFixtures(): MockData {
        return {
            users: usersData.users.map((user) => zUser.parse(user)),
        }
    }

    // Reset to original fixture data
    reset(): void {
        this.mockData = this.loadFixtures()
    }
}

// Export singleton instance
export const mockDataService = MockDataService.getInstance()
