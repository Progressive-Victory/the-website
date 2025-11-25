export interface FetchRequest {
    method: string
    url: string
    body: object | null
    headers: Record<string, string>
}

export interface FetchError extends Error {
    status: number
    message: string
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
