import z from 'zod'

export interface FetchRequest {
    method: string
    url: string
    body: object | null
    headers: Record<string, string>
}

export class FetchError extends Error {
    status: number

    constructor(message: string, status: number) {
        super(message)
        this.status = status
    }
}

export interface AuthRequest {
    discordToken: string
}

export interface AuthResponse {
    accessToken: string
}

export interface SearchRequest {
    page?: number
    limit?: number
    query?: string
    field?: string
    sort?: 'asc' | 'desc'
    filters?: Record<string, string>
}

export const zPaginatedResponse = (schema: z.ZodType) =>
    z.object({
        page: z.number(),
        limit: z.number(),
        count: z.number(),
        data: z.array(schema),
    })
export interface PaginatedResponse<T> {
    page: number
    limit: number
    count: number
    data: T[]
}

export enum ShippingStatus {
    NOT_SHIPPED = 'not_shipped',
    SHIPPED = 'shipped',
}

export const zDocumentUpdate = z.object({
    id: z.string(),
    collectionName: z.string(),
    documentId: z.string(),
    fieldName: z.string(),
    previousValue: z.any(),
    newValue: z.any(),
    updatedAt: z.coerce.date(),
    updatedBy: z.string().nullable(),
})
export type DocumentUpdate = z.infer<typeof zDocumentUpdate>

export const zLocation = z.object({
    zip: z.int(),
    city: z.string(),
    county: z.string(),
    state: z.string(),
})

export type Location = z.infer<typeof zLocation>

export const zPermission = z.object({
    id: z.number(),
    name: z.string(),
})
export type Permission = z.infer<typeof zPermission>

export const zRole = z.object({
    id: z.number(),
    name: z.string(),
    permissions: z.array(zPermission).nullable(),
})
export type Role = z.infer<typeof zRole>

export const zDiscordUser = z.object({
    id: z.string(),
    username: z.string(),
    discriminator: z.string(),
    globalName: z.string().nullable(),
    avatar: z.string().nullable(),
    bot: z.boolean(),
    locale: z.string().nullable(),
    verified: z.boolean(),
})
export type DiscordUser = z.infer<typeof zDiscordUser>

export const zDiscordMember = z.object({
    user: zDiscordUser.nullable(),
    nickname: z.string().nullable(),
    avatar: z.string().nullable(),
    roles: z.array(z.string()),
    joinedAt: z.coerce.date().nullable(),
    deaf: z.boolean(),
    mute: z.boolean(),
    rejoined: z.boolean(),
    pending: z.boolean(),
    timeoutUntil: z.coerce.date().nullable(),
})
export type DiscordMember = z.infer<typeof zDiscordMember>

export const zMapMemberCountResponse = z.object({
    data: z.record(z.string(), z.coerce.number()),
})

export type IMapMemberCountResponse = z.infer<typeof zMapMemberCountResponse>
