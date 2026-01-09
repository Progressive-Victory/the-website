import { AuthRequest, FetchError } from '@/models/models'
import { useSession } from 'next-auth/react'
import z from 'zod'

interface ApiError {
    error: string
    message: string
}

const pvSessionKey = 'pv-session'

export function useFetch() {
    const session = useSession()

    //TODO: Put this into session instead
    async function refreshToken(signal?: AbortSignal) {
        const { apiBaseUrl } = (await (
            await fetch('/api/settings')
        ).json()) as { apiBaseUrl: string }
        localStorage.removeItem(pvSessionKey)

        if (!session.data?.accessToken) return ''

        const body: AuthRequest = {
            discordToken: `Bearer ${session.data?.accessToken}`,
        }

        const res = await fetch(new URL('/auth', apiBaseUrl), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal,
        })

        if (res.ok) {
            const data = (await res.json()) as { accessToken: string }
            localStorage.setItem(pvSessionKey, data.accessToken)
            return data.accessToken
        }

        return ''
    }

    async function getToken(signal?: AbortSignal) {
        return (
            localStorage.getItem(pvSessionKey) ?? (await refreshToken(signal))
        )
    }

    async function onFetch<R = void>(
        method: string,
        url: string,
        body: object | null,
        schema: z.ZodObject | null,
        signal?: AbortSignal
    ) {
        const { apiBaseUrl } = (await (
            await fetch('/api/settings')
        ).json()) as { apiBaseUrl: string }
        const fullUrl = new URL(url, apiBaseUrl)
        const options: RequestInit = {
            method,
            headers: {
                Authorization: `Bearer ${await getToken(signal)}`,
            },
            signal,
        }

        if (body != null && method != 'GET') {
            options.body = JSON.stringify(body)
            options.headers!['Content-Type'] = 'application/json'
        }

        let res = await fetch(fullUrl, options)
        if (res.status === 401) {
            options.headers = {
                ...options.headers,
                Authorization: `Bearer ${await refreshToken(signal)}`,
            }
            res = await fetch(fullUrl, options)
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
