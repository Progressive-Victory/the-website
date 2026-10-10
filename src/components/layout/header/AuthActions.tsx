'use client'

import type { ButtonVariant } from '@/components/common/buttons/Button'
import { AccountButton } from '@/components/common/buttons/button_types/AccountButton'
import { DonateButton } from '@/components/common/buttons/button_types/DonateButton'
import { LoginButton } from '@/components/common/buttons/button_types/LoginButton'
import { TokenClaims } from 'pv-contracts/data'

interface AuthActionsProps {
    isSessionLoading: boolean
    session: TokenClaims | null
    discordUserId: string | undefined
    avatarImageId: string | undefined
    onLogin: () => Promise<void>
    buttonVariant?: ButtonVariant
    showDonate?: boolean
    donateClassName?: string
}

function AccountOrLogin({
    isSessionLoading,
    session,
    discordUserId,
    avatarImageId,
    onLogin,
    buttonVariant,
}: Omit<AuthActionsProps, 'showDonate' | 'donateClassName'>) {
    if (isSessionLoading) {
        return (
            <AccountButton
                label="Account"
                href="/account"
                discordUserId={discordUserId}
                imageId={avatarImageId}
                buttonVariant={buttonVariant}
                disabled
            />
        )
    }

    if (!session) {
        return (
            <LoginButton
                label="Log In"
                buttonVariant={buttonVariant}
                onClick={() => void onLogin()}
            />
        )
    }

    return (
        <AccountButton
            label="Account"
            href="/account"
            discordUserId={discordUserId}
            imageId={avatarImageId}
            buttonVariant={buttonVariant}
        />
    )
}

export function AuthActions({
    showDonate = true,
    donateClassName,
    ...authProps
}: AuthActionsProps) {
    return (
        <>
            {showDonate ? (
                <DonateButton
                    label="Donate"
                    buttonVariant={authProps.buttonVariant}
                    className={donateClassName}
                />
            ) : null}
            <AccountOrLogin {...authProps} />
        </>
    )
}
