import NextAuth, { DefaultSession } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {

    //extends definition of session object to include a field for the discordId
    interface Session extends DefaultSession{
        discordId: string
        accessToken: string
    }

    //extends definition of token object to include a field for the discordId
    interface JWT extends DefaultJWT{
        discordId: string
        accessToken: string
    }
}