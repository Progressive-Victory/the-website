import { useAuth } from './useAuth'
import { ApiError, FetchError } from '@/models'
import z from 'zod'

type QueryPrim = string | number | boolean | null
type QueryParam = QueryPrim | QueryPrim[] | undefined

export type QueryParams = Record<string, QueryParam>
export type ZodSchema = z.ZodObject | z.ZodArray

interface QueryOptions {
    query?: QueryParams
    signal?: AbortSignal
}

export function useFetch() {
    const { apiBaseUrl, session, onRefresh } = useAuth()

    const queryToString = (query: QueryParam): string | undefined => {
        if (query === undefined) return undefined
        if (query === null) return 'null'
        if (Array.isArray(query))
            return query.map((item) => queryToString(item)).join(',')
        return query.toString()
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
            credentials: 'include',
            signal: options?.signal,
        }

        if (body != null) {
            req.body = JSON.stringify(body)
            req.headers ??= {}
            req.headers['Content-Type'] = 'application/json'
        }

        let res = await fetch(fullUrl, req)

        if (session && res.status === 401) {
            await onRefresh()
            res = await fetch(fullUrl, req)
        }

        if (!res.ok) {
            const error = (await res.json()) as ApiError
            throw new FetchError(error.message, res.status, error.error)
        }

        if (res.status !== 204) {
            const data = (await res.json()) as unknown

            if (!schema) return data as R
            const parsed = z.safeParse(schema, data)
            return parsed.data as R
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
        ready: !!apiBaseUrl,
        onFetch,
        onGet,
        onPut,
        onPost,
        onPatch,
        onDelete,
    }
}
