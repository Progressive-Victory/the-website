import { mockDataService } from '@/test/fixtures'
import { createServer, Server } from 'miragejs'

const MIRAGE_API_BASE_URL = 'http://somewhere.over.the.rainbow'

function registerDefaultRoutes(server: Server) {
    server.get('/api/settings', () => ({
        apiBaseUrl: MIRAGE_API_BASE_URL,
    }))

    server.get(`${MIRAGE_API_BASE_URL}/auth`, () => ({
        userId: 1,
        discordUserId: 'test-discord-user-id',
        permissions: [],
    }))

    server.post(`${MIRAGE_API_BASE_URL}/auth/refresh`, () => true)

    server.get(`${MIRAGE_API_BASE_URL}/users/current`, () => {
        // Use mock data service to get a user
        const user =
            mockDataService.getUserById(1) ?? mockDataService.createUser()
        return user
    })

    server.get(
        `${MIRAGE_API_BASE_URL}/discordUsers/:discordUserId/isInServer`,
        (schema: any, request: any) => {
            // Access the dynamic parameter from the request
            const discordUserId = request.params.discordUserId
            console.log('Mocking isInServer for:', discordUserId)

            return { isInServer: true }
        }
    )

    server.put(
        `${MIRAGE_API_BASE_URL}/users/:userId/onboardingStages/ageUp`,
        (schema: any, request: any) => {
            const userId = request.params.userId
            console.log('Mocking ageUp for user:', userId)

            return {}
        }
    )
    server.post(
        `${MIRAGE_API_BASE_URL}/users/:userId/onboardingStages/collectInfo`,
        (schema: any, request: any) => {
            const userId = request.params.userId
            console.log('Mocking collectInfo for user:', userId)

            return {}
        }
    )
    server.put(
        `${MIRAGE_API_BASE_URL}/users/:userId/onboardingStages/verify`,
        (schema: any, request: any) => {
            const userId = request.params.userId
            console.log('Mocking verify for user:', userId)

            return {}
        }
    )

    server.post(
        `${MIRAGE_API_BASE_URL}/users/:userId/onboardingStages/join`,
        (schema: any, request: any) => {
            const userId = request.params.userId
            console.log('Mocking join for user:', userId)

            return {}
        }
    )
}

function startMirage() {
    return createServer({
        routes() {
            registerDefaultRoutes(this)
        },
    })
}

export { startMirage, registerDefaultRoutes, MIRAGE_API_BASE_URL }

/*
afterEach(() => {
    registerDefaultRoutes(server)
    server.db.emptyData()
    // resetGlobalConfig() - if needed later
})
*/
