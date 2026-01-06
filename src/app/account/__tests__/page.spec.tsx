import AccountPage from '../page'
import STUB_GET_USER from '../stubGetUser'
import * as auth_exports from '@/util/auth'
import { Session } from '@auth/core/types'
import { render } from '@testing-library/react'
import { redirect } from 'next/navigation'
import { describe, it, expect, vi, afterEach } from 'vitest'

vi.mock('@/util/auth', () => ({
    auth: vi.fn(),
}))

vi.mock('next/navigation', () => ({
    redirect: vi.fn(),
}))

vi.mock('@/app/account/stubGetUser')

const loginRedirectUrl = '/login?redirect=/account'
const volunteerRedirectUrl = '/volunteer'

describe('Account page', () => {
    afterEach(() => {
        vi.resetAllMocks()
    })

    it('redirects to login page if not authenticated', async () => {
        vi.mocked(
            auth_exports.auth as () => Promise<Session | null>
        ).mockResolvedValue(null)

        vi.mocked(redirect).mockImplementation((url: string) => {
            throw new Error(url)
        })

        let redirectError: Error | undefined

        try {
            render(await AccountPage())
        } catch (e) {
            redirectError = e as Error
        }

        expect(redirectError?.message).equals(loginRedirectUrl)
    })

    it('redirects to volunteer page if no user found', async () => {
        vi.mocked(
            auth_exports.auth as () => Promise<Session | null>
        ).mockResolvedValue({ expires: '2025/12/20' })

        vi.mocked(STUB_GET_USER).mockImplementation(() => {
            return null
        })

        vi.mocked(redirect).mockImplementation((url: string) => {
            throw new Error(url)
        })

        let redirectError: Error | undefined

        try {
            render(await AccountPage())
        } catch (e) {
            redirectError = e as Error
        }

        expect(redirectError?.message).equals(volunteerRedirectUrl)
    })
})
