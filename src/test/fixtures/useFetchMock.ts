import { ZodSchema } from '@/util/hooks/useFetch'
import { vi } from 'vitest'

export type OnGetMock = <R>(
    url: string,
    schema: ZodSchema,
    options?: { query?: Record<string, unknown> }
) => Promise<R>

export const getFetchMocks = () => ({
    ready: true,
    onFetch: vi.fn(),
    onGet: vi.fn(),
    onPut: vi.fn(),
    onPost: vi.fn(),
    onPatch: vi.fn(),
    onDelete: vi.fn(),
})
