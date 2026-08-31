import { ProtectedPage } from './ProtectedPage'
import { TokenClaims, User } from '@/contracts/data'
import { useAuth, useCurrentUser } from '@/util/hooks'
import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const replace = vi.fn()

vi.mock('next/navigation', () => ({
    usePathname: () => '/admin',
    useRouter: () => ({ replace }),
}))

vi.mock('@/util/hooks', () => ({
    useAuth: vi.fn(),
    useCurrentUser: vi.fn(),
}))

const mockedUseAuth = vi.mocked(useAuth)
const mockedUseCurrentUser = vi.mocked(useCurrentUser)

const session: TokenClaims = {
    userId: 123,
    discordUserId: 'discord-123',
    permissions: [],
}

const userWithRoles = (...roles: string[]) =>
    ({
        roles: roles.map((role, index) => ({ id: index + 1, name: role })),
    }) as User

describe('ProtectedPage', () => {
    beforeEach(() => {
        replace.mockClear()
        mockedUseCurrentUser.mockReturnValue({
            data: undefined,
            isLoading: false,
            error: null,
            onRefetch: vi.fn(),
            onInvalidate: vi.fn(),
        })
    })

    it('redirects unauthenticated users to login with a 401 error', async () => {
        mockedUseAuth.mockReturnValue({
            apiBaseUrl: 'https://api.example.com',
            isSessionLoading: false,
            session: null,
            onLogin: vi.fn(),
            onRefresh: vi.fn(),
            onLogout: vi.fn(),
        })

        render(
            <ProtectedPage requiredRoles={['Superadmin']}>
                Protected content
            </ProtectedPage>
        )

        await waitFor(() => {
            expect(replace).toHaveBeenCalledWith(
                '/login?error=401&redirect=%2Fadmin'
            )
        })
        expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
    })

    it('redirects authenticated users without required roles to 404', async () => {
        mockedUseAuth.mockReturnValue({
            apiBaseUrl: 'https://api.example.com',
            isSessionLoading: false,
            session,
            onLogin: vi.fn(),
            onRefresh: vi.fn(),
            onLogout: vi.fn(),
        })
        mockedUseCurrentUser.mockReturnValue({
            data: userWithRoles('Member'),
            isLoading: false,
            error: null,
            onRefetch: vi.fn(),
            onInvalidate: vi.fn(),
        })

        render(
            <ProtectedPage requiredRoles={['Superadmin']}>
                Protected content
            </ProtectedPage>
        )

        await waitFor(() => {
            expect(replace).toHaveBeenCalledWith('/404')
        })
        expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
    })

    it('renders children for authenticated users with required roles', () => {
        mockedUseAuth.mockReturnValue({
            apiBaseUrl: 'https://api.example.com',
            isSessionLoading: false,
            session,
            onLogin: vi.fn(),
            onRefresh: vi.fn(),
            onLogout: vi.fn(),
        })
        mockedUseCurrentUser.mockReturnValue({
            data: userWithRoles('Superadmin'),
            isLoading: false,
            error: null,
            onRefetch: vi.fn(),
            onInvalidate: vi.fn(),
        })

        render(
            <ProtectedPage requiredRoles={['Superadmin']}>
                Protected content
            </ProtectedPage>
        )

        expect(screen.getByText('Protected content')).toBeInTheDocument()
        expect(replace).not.toHaveBeenCalled()
    })
})
