import { vi } from 'vitest'

export const getFetchMocks = () => ({
    ready: true,
    onFetch: vi.fn(),
    onGet: vi.fn(),
    onPut: vi.fn(),
    onPost: vi.fn(),
    onPatch: vi.fn(),
    onDelete: vi.fn(),
})
