import { User } from '@/contracts/data'
import { MockDataService, mockDataService } from '@/test/mockDataService'
import { createServer, Model, Registry, Request, Server } from 'miragejs'
import 'miragejs'
import { FactoryDefinition } from 'miragejs/-types'
import Schema from 'miragejs/orm/schema'

export const MIRAGE_API_BASE_URL = 'http://somewhere.over.the.rainbow'

const UserModel = Model.extend<Partial<User>>({})
export type AppRegistry = Registry<
    { user: typeof UserModel },
    Record<string, FactoryDefinition>
>
export type AppSchema = Schema<AppRegistry>

export function registerDefaultRoutes(server: Server) {
    server.get('/api/settings', () => ({
        apiBaseUrl: MIRAGE_API_BASE_URL,
    }))

    server.get(`${MIRAGE_API_BASE_URL}/auth`, () =>
        mockDataService.getTokenClaimsForUser()
    )

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
}

export function startMirage({ environment = 'test' } = {}) {
    return createServer({
        environment,
        trackRequests: true,
        routes() {
            registerDefaultRoutes(this)
        },
        models: {
            user: UserModel,
        },
    })
}
