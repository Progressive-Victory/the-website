import NextAuth from 'next-auth'
import {User as NextAuthUser} from 'next-auth'
import Discord from 'next-auth/providers/discord'
import { Profile } from 'next-auth'
import { JWT } from "next-auth/jwt"
const authOptions = {
    providers: [
        Discord({
            clientId: process.env.DISCORD_CLIENT_ID!,
            clientSecret: process.env.DISCORD_CLIENT_SECRET!,
        })
    ], callbacks: {
    async jwt({token, user, profile }: {token: JWT, user: NextAuthUser, profile: Profile}) {
        // console.log("jwt!!!" )
        token.global_name = profile.global_name
        return token
        }
    }
    
    
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
