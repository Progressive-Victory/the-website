import { AuthRequest, FetchError } from '@/models/models'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import z from 'zod'

interface ApiError {
    error: string
    message: string
}

interface QueryOptions {
    query?: [string, string][]
    signal?: AbortSignal
}

type ZodSchema = z.ZodObject | z.ZodArray | z.ZodRecord;

const pvSessionKey = 'pv-session'

export function useFetch() {
    const session = useSession()

    const [apiBaseUrl, setApiBaseUrl] = useState('')

    async function getBaseUrl(signal?: AbortSignal) {
        if (apiBaseUrl) return apiBaseUrl

        const res = await fetch('/api/settings', { signal })
        const { apiBaseUrl: baseUrl } = (await res.json()) as {
            apiBaseUrl: string
        }
        setApiBaseUrl(baseUrl)
        return baseUrl
    }

    //TODO: Put this into session instead
    async function refreshToken(signal?: AbortSignal) {
        localStorage.removeItem(pvSessionKey)

        if (!session.data?.accessToken) return ''

        const body: AuthRequest = {
            discordToken: `Bearer ${session.data?.accessToken}`,
        }

        const baseUrl = await getBaseUrl(signal)
        const res = await fetch(new URL('/auth', baseUrl), {
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
        schema: ZodSchema | null,
        options?: QueryOptions
    ) {
        const baseUrl = await getBaseUrl(options?.signal)

        const fullUrl = new URL(url, baseUrl)
        options?.query?.forEach((entry) => {
            fullUrl.searchParams.append(entry[0], entry[1])
        })

        const req: RequestInit = {
            method,
            headers: {
                Authorization: `Bearer ${await getToken(options?.signal)}`,
            },
            signal: options?.signal,
        }

        if (body != null && method != 'GET') {
            req.body = JSON.stringify(body)
            req.headers!['Content-Type'] = 'application/json'
        }

        let res = await fetch(fullUrl, req)
        if (res.status === 401) {
            req.headers = {
                ...req.headers,
                Authorization: `Bearer ${await refreshToken(options?.signal)}`,
            }
            res = await fetch(fullUrl, req)
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
        schema: ZodSchema,
        options?: QueryOptions
    ) {
        return await onFetch<R>('GET', url, null, schema, options)
    }

    async function onPut(
        url: string,
        body: object | null,
        options?: QueryOptions
    ) {
        await onFetch('PUT', url, body, null, options)
    }

    async function onPost<R = void>(
        url: string,
        body: object | null,
        schema: ZodSchema | null,
        options?: QueryOptions
    ) {
        return await onFetch<R>('POST', url, body, schema, options)
    }

    async function onPatch<R = void>(
        url: string,
        body: object | null,
        schema: ZodSchema | null,
        options?: QueryOptions
    ) {
        return await onFetch<R>('PATCH', url, body, schema, options)
    }

    async function onDelete(url: string, options?: QueryOptions) {
        await onFetch('DELETE', url, null, null, options)
    }

    return { onFetch, onGet, onPut, onPost, onPatch, onDelete }
}
