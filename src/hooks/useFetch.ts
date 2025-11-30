import { FetchError, FetchRequest } from '@/models'
import z from 'zod'

interface ApiError {
    error: string
    message: string
}

export function useFetch() {
    //TODO: Put this into session instead
    async function refreshToken() {
        const res = await fetch('/api/fetch/auth', { method: 'POST' })

        if (res.ok) {
            const data = (await res.json()) as { accessToken: string }
            document.cookie = `pv-session=${data.accessToken};secure`
            return data.accessToken
        }

        return ''
    }

    async function getToken() {
        return (
            /(^|;)\s*pv-session\s*=\s*([^;]+)/.exec(document.cookie)?.pop() ??
            (await refreshToken())
        )
    }

    async function onFetch<R = void>(
        method: string,
        url: string,
        body: object | null,
        schema: z.ZodObject | null,
        signal?: AbortSignal
    ) {
        const req: FetchRequest = {
            method,
            url,
            body,
            headers: {
                Authorization: `Bearer ${await getToken()}`,
            },
        }

        const options: RequestInit = {
            method: 'POST',
            body: JSON.stringify(req),
            signal,
        }

        let res = await fetch('/api/fetch', options)
        if (res.status === 401) {
            options.headers = {
                Authorization: `Bearer ${await refreshToken()}`,
            }
            res = await fetch('/api/fetch', options)
        }

        if (!res.ok) {
            const error = (await res.json()) as ApiError
            throw {
                status: res.status,
                cause: error.error,
                message: error.message,
            } as FetchError
        }

        const data = (await res.json()) as unknown

        if (!schema) return data as R
        return z.parse(schema, data) as R
    }

    async function onGet<R>(
        url: string,
        schema: z.ZodObject,
        signal?: AbortSignal
    ) {
        return await onFetch<R>('GET', url, null, schema, signal)
    }

    async function onPut(
        url: string,
        body: object | null,
        signal?: AbortSignal
    ) {
        await onFetch('PUT', url, body, null, signal)
    }

    async function onPost<R = void>(
        url: string,
        body: object | null,
        schema: z.ZodObject | null,
        signal?: AbortSignal
    ) {
        return await onFetch<R>('POST', url, body, schema, signal)
    }

    async function onPatch<R = void>(
        url: string,
        body: object | null,
        schema: z.ZodObject | null,
        signal?: AbortSignal
    ) {
        return await onFetch<R>('PATCH', url, body, schema, signal)
    }

    async function onDelete(url: string, signal?: AbortSignal) {
        await onFetch('DELETE', url, null, null, signal)
    }

    return { onFetch, onGet, onPut, onPost, onPatch, onDelete }
}
