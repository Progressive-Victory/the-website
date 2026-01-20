import Account from '../Account'
import { render } from '@testing-library/react'
import { useSession } from 'next-auth/react'
import { describe, it, expect, vi, afterEach } from 'vitest'

const testUserData = {
    discordUsername: 'discordUsername',
    discordId: 'discordId',
    firstName: 'Eric',
    lastName: 'Oseid',
    dateOfBirth: new Date('1994-11-27T03:24:00'),
    city: 'Seattle',
    state: 'WA',
    zip: 98102,
    addressLine1: '3100 Fairview Ave E',
    addressLine2: 'Apt 109',
    emailAddress: 'ericoseid@gmail.com',
    phoneNumber: '6036678599',
}

vi.mock('next-auth/react', () => ({
    useSession: vi.fn(),
}))

describe('Account page', () => {
    afterEach(() => {
        vi.resetAllMocks()
    })

    it('Does some sheeit', () => {
        vi.mocked(useSession).mockResolvedValue({
            update: vi.fn(),
            data: {
                discordId: '123',
                accessToken: 'accessToken',
                apiUrl: 'apiUrl',
                expires: 'expires',
            },
            status: 'authenticated',
        })

        const { getByText } = render(<Account {...testUserData}></Account>)

        expect(getByText('Username:')).toBeVisible()
    })
})
