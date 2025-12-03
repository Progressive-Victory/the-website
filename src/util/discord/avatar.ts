import { calculateUserDefaultAvatarIndex, ImageURLOptions } from "@discordjs/rest";
import { Snowflake } from "discord-api-types/globals";
import { rest } from "./rest";
import { HTTPStatus } from "../https-status";

// const GUILD_ID = process.env.GUILD_ID

// if (!GUILD_ID) throw Error("Please specify 'GUILD_ID' in the environment file.")

// export async function getGuildAvatar(userId:Snowflake, avatar:string | null = null, imageOptions: Readonly<ImageURLOptions> = {forceStatic: true}) {
//     let avatarURL: string | null = null
//     if(avatar) avatarURL = rest.cdn.guildMemberAvatar(GUILD_ID ?? 'error', userId, avatar, imageOptions)
//     if(avatarURL && await isFound(avatarURL)) return avatarURL
//     return getDefaultAvatar(userId)   
// }

export async function getUserAvatarURL(userId:Snowflake, avatar:string | null = null, imageOptions: Readonly<ImageURLOptions> = {forceStatic: true}) {
    let avatarURL: string | null = null
    if(avatar) avatarURL = rest.cdn.avatar(userId, avatar, imageOptions)
    if(avatarURL && await isFound(avatarURL)) return avatarURL
    return getDefaultAvatar(userId)    
}

function getDefaultAvatar(id:Snowflake) {
    return rest.cdn.defaultAvatar(calculateUserDefaultAvatarIndex(id))
}

async function isFound(url:string) {
    const request = await fetch(url, { method: 'HEAD' })
    return request.status === HTTPStatus.Ok
}