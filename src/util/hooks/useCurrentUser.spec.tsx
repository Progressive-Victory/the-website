import { clearQueryClient } from '@/app/QueryClientWrapper'
import QueryClientWrapper from '@/app/QueryClientWrapper'
import { startMirage, registerDefaultRoutes } from '@/test/mirage'
import { MockDataService, mockDataService } from '@/test/mockDataService'
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

describe('useCurrentUser', () => {
    it('should fetch the current user when ready', async () => {
        const { result } = renderHook(() => useCurrentUser(), {
            wrapper: QueryClientWrapper,
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
                        mockDataService.createRole('Member', [
                            mockDataService.createPermission('READ', 1),
                        ]),
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
                        mockDataService.createRole('Member', [
                            mockDataService.createPermission('WRITE', 1),
                        ]),
                    ],
                }),
                'WRITE'
            )
        ).toBe(true)
    })
})
