export interface FetchRequest {
    method: string
    url: string
    body?: object
    requiredRoles?: string[]
}

export interface FetchError extends Error {
    status: number
    message: string
}

interface ApiError {
    error: string
    message: string
}

async function apiFetch<R = void>(
    method: string,
    url: string,
    body?: object,
    requiredRoles?: string[]
): Promise<R> {
    const req: FetchRequest = {
        method,
        url,
        body,
        requiredRoles: requiredRoles?.length ? requiredRoles : undefined,
    }

    const res = await fetch('/api/fetch', {
        method: 'GET',
        body: JSON.stringify(req),
    })

    const data: unknown = await res.json()

    if (!res.ok) {
        const error = data as ApiError
        throw {
            status: res.status,
            cause: error.error,
            message: error.message,
        } as FetchError
    }

    return data as R
}

export async function apiGet<R>(
    url: string,
    requiredRoles?: string[]
): Promise<R> {
    return await apiFetch<R>('GET', url, undefined, requiredRoles)
}

export async function apiPut(
    url: string,
    body?: object,
    requiredRoles?: string[]
): Promise<void> {
    await apiFetch<void>('PUT', url, body, requiredRoles)
}

export async function apiPost<R = void>(
    url: string,
    body?: object,
    requiredRoles?: string[]
): Promise<R> {
    return await apiFetch<R>('POST', url, body, requiredRoles)
}

export async function apiPatch<R = void>(
    url: string,
    body?: object,
    requiredRoles?: string[]
): Promise<R> {
    return await apiFetch<R>('PATCH', url, body, requiredRoles)
}

export async function apiDelete(url: string, requiredRoles?: string[]) {
    await apiFetch('DELETE', url, undefined, requiredRoles)
}
