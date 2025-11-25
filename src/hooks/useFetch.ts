import { FetchError, FetchRequest } from '@/models'

interface ApiError {
    error: string
    message: string
}

export function useFetch() {
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

        return (await res.json()) as R
    }

    async function onGet<R>(url: string, signal?: AbortSignal) {
        return await onFetch<R>('GET', url, null, signal)
    }

    async function onPut(
        url: string,
        body: object | null,
        signal?: AbortSignal
    ) {
        await onFetch<void>('PUT', url, body, signal)
    }

    async function onPost<R = void>(
        url: string,
        body: object | null,
        signal?: AbortSignal
    ) {
        return await onFetch<R>('POST', url, body, signal)
    }

    async function onPatch<R = void>(
        url: string,
        body: object | null,
        signal?: AbortSignal
    ) {
        return await onFetch<R>('PATCH', url, body, signal)
    }

    async function onDelete(url: string, signal?: AbortSignal) {
        await onFetch('DELETE', url, null, signal)
    }

    return { onFetch, onGet, onPut, onPost, onPatch, onDelete }
}
