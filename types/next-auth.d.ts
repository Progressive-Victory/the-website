import NextAuth, { DefaultSession } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {

    interface Session extends DefaultSession{
        discordId: string
    }

    interface JWT extends DefaultJWT{
        discordId: string
    }
}