import { Snowflake } from "discord-api-types/globals";
import { rest } from "./rest";
import { APIGuildMember, Routes } from "discord-api-types/v10";

export function joinMember(userId: Snowflake, accessToken: string) {
  if (!process.env.GUILD_ID) throw Error("Please specify 'GUILD_ID' in the environment file.")

  return rest.put(Routes.guildMember(process.env.GUILD_ID, userId), {
    body: JSON.stringify({ access_token: accessToken })
  }) as Promise<APIGuildMember | object>
}

export function getMember(userId: Snowflake) {
  if (!process.env.GUILD_ID) throw Error("Please specify 'GUILD_ID' in the environment file.")

  return rest.get(Routes.guildMember(process.env.GUILD_ID, userId)) as Promise<APIGuildMember>
}
