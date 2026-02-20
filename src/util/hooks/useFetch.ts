import { AuthRequest } from '@/contracts/requests'
import { AuthResponse } from '@/contracts/responses'
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import z from 'zod'

interface ApiError {
    error: string
    message: string
}

type QueryPrim = string | number | boolean | null
type QueryParam = QueryPrim | QueryPrim[] | undefined

export type QueryParams = Record<string, QueryParam>
export type ZodSchema = z.ZodObject | z.ZodArray

interface QueryOptions {
    query?: QueryParams
    signal?: AbortSignal
}

const pvSessionKey = 'pv-session'

export class FetchError extends Error {
    status: number

    constructor(message: string, status: number) {
        super(message)
        this.status = status
    }
}

export function useFetch() {
    const session = useSession()

    const settingsQuery = useQuery({
        queryKey: ['/api/settings'],
        async queryFn({ signal }) {
            const res = await fetch('/api/settings', { signal })
            return (await res.json()) as {
                apiBaseUrl: string
            }
        },
        staleTime: Infinity,
        placeholderData: keepPreviousData,
    })

    const onSignOut = () => {
        localStorage.removeItem(pvSessionKey)
    }

    const queryToString = (query: QueryParam): string | undefined => {
        if (query === undefined) return undefined
        if (query === null) return 'null'
        if (Array.isArray(query))
            return query.map((item) => queryToString(item)).join(',')
        return query.toString()
    }

    // TODO: Put this into global state and delay until it's loaded
    const apiBaseUrl = settingsQuery.data?.apiBaseUrl
    const ready = !!apiBaseUrl

    const authMutation = useMutation({
        mutationKey: ['/auth'],
        mutationFn: async (signal?: AbortSignal) => {
            const body: AuthRequest = {
                discordToken: `Bearer ${session.data?.accessToken}`,
            }

            const res = await fetch(new URL('/auth', apiBaseUrl), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
                signal,
            })

            const data = (await res.json()) as AuthResponse
            return data.accessToken
        },
    })

    async function refreshToken(signal?: AbortSignal) {
        console.log('refreshing token')
        localStorage.removeItem(pvSessionKey)

        await authMutation.mutateAsync(signal)
        const accessToken = authMutation.data

        if (accessToken) localStorage.setItem(pvSessionKey, accessToken)
        return accessToken
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
        const fullUrl = new URL(url, apiBaseUrl)
        Object.entries(options?.query ?? {}).forEach(([key, value]) => {
            const str = queryToString(value)
            if (str != null) fullUrl.searchParams.set(key, str)
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

        if (res.status !== 204) {
            const data = (await res.json()) as unknown
            console.log(data)

            if (!schema) return data as R
            return z.parse(schema, data) as R
        } else {
            return {} as R
        }
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

    return {
        ready,
        onSignOut,
        onFetch,
        onGet,
        onPut,
        onPost,
        onPatch,
        onDelete,
    }
}
