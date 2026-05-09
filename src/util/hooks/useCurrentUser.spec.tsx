import { startMirage, registerDefaultRoutes } from '@/app/mirage'
import { MockDataService, mockDataService } from '@/test/fixtures'
import { createQueryWrapper, clearQueryClient } from '@/test/fixtures/testUtils'
import { useCurrentUser, hasPermission } from '@/util/hooks/useCurrentUser'
import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'

let server: ReturnType<typeof startMirage>

beforeAll(() => {
    server = startMirage()
})

afterAll(() => {
    server.shutdown()
})

afterEach(() => {
    registerDefaultRoutes(server)
    clearQueryClient()
})

function createWrapper() {
    return createQueryWrapper()
}

describe('useCurrentUser', () => {
    it('should fetch the current user when ready', async () => {
        const { result } = renderHook(() => useCurrentUser(), {
            wrapper: createWrapper(),
        })

        await waitFor(() => {
            expect(result.current.data).toBeDefined()
        })

        expect(result.current.data?.id).toBe(MockDataService.DEFAULT_USER_ID)
        expect(result.current.isLoading).toBe(false)
        expect(result.current.error).toBeNull()
    })

    it('should return false for missing permissions', () => {
        expect(
            hasPermission(
                mockDataService.createUser({
                    roles: [
                        {
                            id: 1,
                            name: 'Member',
                            permissions: [{ id: 1, name: 'READ' }],
                        },
                    ],
                }),
                'WRITE'
            )
        ).toBe(false)
    })

    it('should return true when permission exists', () => {
        expect(
            hasPermission(
                mockDataService.createUser({
                    roles: [
                        {
                            id: 1,
                            name: 'Member',
                            permissions: [{ id: 1, name: 'WRITE' }],
                        },
                    ],
                }),
                'WRITE'
            )
        ).toBe(true)
    })
})
