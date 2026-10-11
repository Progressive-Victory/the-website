// @vitest-environment jsdom
import { AccountDetailsSection } from './AccountDetailsSection'
import type { User } from '@/contracts/data'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mockOnGet = vi.fn()

vi.mock('@/util/hooks', () => ({
    useFetch: () => ({ ready: true, onGet: mockOnGet }),
}))
vi.mock('../../home/MemberBanner', () => ({ default: () => null }))
vi.mock('../AccountInfoForm', () => ({ AccountInfoForm: () => null }))

const fakeUser = {
    firstName: 'Test',
    lastName: 'User',
    phone: null,
    shirtSize: null,
    email: 'test@example.com',
    donors: [],
    discordUsers: [],
    duesPayingMember: false,
    address: {
        addressLine1: null,
        addressLine2: null,
        city: null,
        state: null,
        zip: null,
    },
} as unknown as User

function renderSection() {
    return render(
        <QueryClientProvider client={new QueryClient()}>
            <AccountDetailsSection
                userData={fakeUser}
                canAccessAdminPanel={false}
                handleSignOut={vi.fn()}
                onSave={vi.fn()}
                donorLinkError={null}
                onDonorLinkSubmit={vi.fn()}
            />
        </QueryClientProvider>
    )
}

async function submitLink(email: string, order: string) {
    await userEvent.click(screen.getByRole('button', { name: /link actblue/i }))
    await userEvent.type(screen.getByLabelText(/email address/i), email)
    await userEvent.type(screen.getByLabelText(/order number/i), order)
    await userEvent.click(screen.getByRole('button', { name: /^link$/i }))
}

// Testing Library's automatic cleanup is not active in this repo's Vitest
// setup, so unmount each render ourselves to keep tests isolated.
afterEach(() => {
    cleanup()
})

describe('ActBlue link form', () => {
    beforeEach(() => {
        mockOnGet.mockReset()
    })

    it('trims input and opens the modal only after the contribution is found', async () => {
        mockOnGet.mockResolvedValue({
            email: 'a@b.com',
            contributions: [{ orderNumber: '12345' }],
        })
        renderSection()
        await submitLink('  a@b.com ', ' 12345 ')

        expect(mockOnGet).toHaveBeenCalledWith(
            expect.any(String),
            expect.anything(),
            expect.objectContaining({ params: { donorEmail: 'a@b.com' } })
        )
        expect(await screen.findByRole('dialog')).toBeInTheDocument()
    })

    it('shows an error and no modal when the order number is not found', async () => {
        mockOnGet.mockResolvedValue({
            email: 'a@b.com',
            contributions: [{ orderNumber: '999' }],
        })
        renderSection()
        await submitLink('a@b.com', '12345')

        expect(
            await screen.findByText(/could not find a contribution/i)
        ).toBeInTheDocument()
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('shows the error and keeps the form when the lookup fails', async () => {
        mockOnGet.mockImplementation(() =>
            Promise.reject(new Error('Donor not found'))
        )
        renderSection()
        await submitLink('a@b.com', '12345')

        expect(await screen.findByText('Donor not found')).toBeInTheDocument()
        expect(screen.getByLabelText(/order number/i)).toBeInTheDocument()
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
})
