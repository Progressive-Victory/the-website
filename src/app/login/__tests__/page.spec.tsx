import Login from '../page'
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

vi.mock('@/app/login/LoginPage', () => ({
    LoginPage: (props: { redirect: string | null }) => {
        return (
            <div>
                <p>{props.redirect}</p>
            </div>
        )
    },
}))

const redirectUrl = 'https://url.com'
const accountUrl = '/account'

describe('Login page', () => {
    afterEach(() => {
        vi.resetAllMocks()
    })

    it('redirects to provided URL if there is an authenticated session', async () => {
        vi.mocked(
            auth_exports.auth as () => Promise<Session | null>
        ).mockResolvedValue({ expires: '2025/12/20' })

        render(
            await Login({
                searchParams: new Promise((resolve) => {
                    resolve({
                        redirect: redirectUrl,
                    })
                }),
            })
        )

        expect(redirect).toHaveBeenCalledExactlyOnceWith(redirectUrl)
    })

    it('redirects to /account if no redirect url provided', async () => {
        vi.mocked(
            auth_exports.auth as () => Promise<Session | null>
        ).mockResolvedValue({ expires: '2025/12/20' })

        render(
            await Login({
                searchParams: new Promise((resolve) => {
                    resolve({})
                }),
            })
        )

        expect(redirect).toHaveBeenCalledExactlyOnceWith(accountUrl)
    })

    it('displays login page if there is no session', async () => {
        vi.mocked(
            auth_exports.auth as () => Promise<Session | null>
        ).mockResolvedValue(null)

        const { getByText } = render(
            await Login({
                searchParams: new Promise((resolve) => {
                    resolve({
                        redirect: redirectUrl,
                    })
                }),
            })
        )

        expect(getByText(redirectUrl)).toBeVisible()
    })

    it('passes account url to login page if no redirect url provided', async () => {
        vi.mocked(
            auth_exports.auth as () => Promise<Session | null>
        ).mockResolvedValue(null)

        const { getByText } = render(
            await Login({
                searchParams: new Promise((resolve) => {
                    resolve({})
                }),
            })
        )

        expect(getByText(accountUrl)).toBeVisible()
    })
})
