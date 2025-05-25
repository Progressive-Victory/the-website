export * from './AvatarURL'
export * from './typecheck'

import { REST } from "@discordjs/rest"

const discordToken = process.env.DISCORD_BOT_TOKEN

if (!discordToken) {
    throw new Error(
        "Please specify 'DISCORD_BOT_TOKEN' in the environment file."
    )
}

export const rest = new REST({ version: '10' }).setToken(discordToken)