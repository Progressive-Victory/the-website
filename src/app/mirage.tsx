import { User } from '@/contracts/data'
import { MockDataService, mockDataService } from '@/test/fixtures'
import { createServer, Model, Registry, Request, Server } from 'miragejs'
import Schema from 'miragejs/orm/schema'

const MIRAGE_API_BASE_URL = 'http://somewhere.over.the.rainbow'

const UserModel = Model.extend<Partial<User>>({})
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type AppRegistry = Registry<{ user: typeof UserModel }, {}>
type AppSchema = Schema<AppRegistry>

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
        const user = mockDataService.getUserById(
            MockDataService.VERIFIED_USER_ID
        )
        return user
    })

    server.get(
        `${MIRAGE_API_BASE_URL}/discordUsers/:discordUserId/isInServer`,
        (schema: AppSchema, request: Request) => {
            // Access the dynamic parameter from the request
            const discordUserId = request.params.discordUserId
            console.log('Mocking isInServer for:', discordUserId)

            return { isInServer: true }
        }
    )

    server.put(
        `${MIRAGE_API_BASE_URL}/users/:userId/onboardingStages/ageUp`,
        (schema: AppSchema, request: Request) => {
            const userId = request.params.userId
            console.log('Mocking ageUp for user:', userId)

            return {}
        }
    )
    server.post(
        `${MIRAGE_API_BASE_URL}/users/:userId/onboardingStages/collectInfo`,
        (schema: AppSchema, request: Request) => {
            const userId = request.params.userId
            console.log('Mocking collectInfo for user:', userId)

            return {}
        }
    )
    server.put(
        `${MIRAGE_API_BASE_URL}/users/:userId/onboardingStages/verify`,
        (schema: AppSchema, request: Request) => {
            const userId = request.params.userId
            console.log('Mocking verify for user:', userId)

            return {}
        }
    )

    server.post(
        `${MIRAGE_API_BASE_URL}/users/:userId/onboardingStages/join`,
        (schema: AppSchema, request: Request) => {
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
        models: {
            user: UserModel,
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
