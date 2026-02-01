import { DefaultSession } from 'next-auth'
import { DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
    // Extends the definition of the session object to include additional fields from server to client
    interface Session extends DefaultSession {
        discordId: string
        accessToken: string
        refreshToken: string
        apiUrl: string
    }

    // Extends the definition the of token object to include a field for the discordId/accessToken
    interface JWT extends DefaultJWT {
        discordId: string
        accessToken: string
        refreshToken: string
    }
}
