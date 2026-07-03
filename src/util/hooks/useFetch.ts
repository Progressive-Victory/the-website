import { useAuth } from './useAuth'
import { ApiError, FetchError } from '@/models'
import z from 'zod'

type QueryPrim = string | number | boolean | null
type QueryParam = QueryPrim | QueryPrim[] | undefined

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
export type RouteParams = Record<string, string | number | boolean>
export type QueryParams = Record<string, QueryParam>
export type ZodSchema = z.ZodObject | z.ZodArray | z.ZodRecord

interface QueryOptions {
    params?: RouteParams
    query?: QueryParams
    signal?: AbortSignal
}

export function useFetch() {
    const { apiBaseUrl, session, onRefresh } = useAuth()

    async function onFetch<S extends ZodSchema | null>(
        method: HttpMethod,
        route: string,
        body: object | null,
        schema: S,
        options?: QueryOptions
    ) {
        const { params = {}, query = {}, signal } = options ?? {}

        if (!/^(?:\/:?[\w-]+)+$/.test(route))
            throw new Error(
                'Invalid fetch! Routes can only contain substitution keys or path identifiers'
            )

        const encodedRoute = route.replaceAll(/:([\w-]+)/g, (_, key) => {
            const value = params[key as string]
            if (value != null) return encodeURIComponent(value)
            throw new Error(
                `Invalid fetch! Substitution key :${key} does not exist in params`
            )
        })

        const url = new URL(encodedRoute, apiBaseUrl)

        Object.entries(query).forEach(([key, value]) => {
            if (value === undefined) return
            if (!Array.isArray(value)) {
                url.searchParams.append(key, String(value))
            } else {
                value.forEach((elem) => {
                    if (elem === undefined) return
                    url.searchParams.append(key, String(elem))
                })
            }
        })

        const req: RequestInit = {
            method,
            // TODO: This should be same-origin on prod
            credentials: 'include',
            signal,
        }
        req.headers = {}

        if (body != null) {
            if (!['POST', 'PATCH', 'PUT'].includes(method))
                throw new Error(
                    `Invalid fetch! HTTP ${method} cannot have a body`
                )

            req.body = JSON.stringify(body)
            req.headers['Content-Type'] = 'application/json'
        }

        let res = await fetch(url, req)

        if (session && res.status === 401) {
            await onRefresh()
            res = await fetch(url, req)
        }

        if (!res.ok) {
            const error = (await res.json()) as ApiError
            throw new FetchError(error.message, res.status, error.error)
        }

        const content =
            res.status === 204 ? undefined : ((await res.json()) as unknown)

        const parsed = z.parse(schema ?? z.undefined(), content)
        return parsed as S extends null ? void : z.infer<S>
    }

    async function onGet<S extends ZodSchema>(
        url: string,
        schema: S,
        options?: QueryOptions
    ) {
        return await onFetch<S>('GET', url, null, schema, options)
    }

    async function onPut<S extends ZodSchema | null>(
        url: string,
        body: object | null,
        schema: S,
        options?: QueryOptions
    ) {
        await onFetch<S>('PUT', url, body, schema, options)
    }

    async function onPost<S extends ZodSchema | null>(
        url: string,
        body: object | null,
        schema: S,
        options?: QueryOptions
    ) {
        return await onFetch<S>('POST', url, body, schema, options)
    }

    async function onPatch<S extends ZodSchema | null>(
        url: string,
        body: object | null,
        schema: S,
        options?: QueryOptions
    ) {
        return await onFetch<S>('PATCH', url, body, schema, options)
    }

    async function onDelete(url: string, options?: QueryOptions) {
        return await onFetch('DELETE', url, null, null, options)
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
