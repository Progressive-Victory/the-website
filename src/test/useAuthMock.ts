import { MIRAGE_API_BASE_URL } from '@/test/mirage'
import { MockDataService } from '@/test/mockDataService'
import type * as authModule from '@/util/hooks/useAuth'
import { vi } from 'vitest'

export const getSuccessfulAuthReturn = (
    userId = MockDataService.DEFAULT_USER_ID
): ReturnType<typeof authModule.useAuth> => ({
    apiBaseUrl: MIRAGE_API_BASE_URL,
    isSessionLoading: false,
    session: {
        userId,
        discordUserId: 'test-discord-user',
        permissions: [],
    },
    onLogin: vi.fn(),
    onRefresh: vi.fn().mockResolvedValue(true),
    onLogout: vi.fn(),
})
