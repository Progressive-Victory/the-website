'use client'

import styles from '@/components/common/button.module.css'
import Image from 'next/image'
import type React from 'react'

type ButtonStyleKey =
    | 'primary'
    | 'secondary'
    | 'plain'
    | 'prominent'
    | 'minimal'
type ButtonFunctionKey = 'alert' | 'link'
type ButtonType =
    | 'custom'
    | 'alert'
    | 'nav'
    | 'subnav'
    | 'login'
    | 'donate'
    | 'account'
type ButtonVariant = 'default' | 'long'

const buttonTypeConfig: Record<
    Exclude<ButtonType, 'custom'>,
    {
        style: ButtonStyleKey
        func: ButtonFunctionKey
        href?: string
        alertMessage?: string
    }
> & {
    custom: {
        style?: ButtonStyleKey
        func?: ButtonFunctionKey
    }
} = {
    custom: {
        style: undefined,
        func: undefined,
    },
    alert: {
        style: 'prominent',
        func: 'alert',
    },
    nav: {
        style: 'plain',
        func: 'link',
    },
    subnav: {
        style: 'minimal',
        func: 'link',
    },
    login: {
        style: 'primary',
        func: 'link',
    },
    donate: {
        style: 'prominent',
        func: 'link',
        href: 'https://secure.actblue.com/donate/pvwebsite',
    },
    account: {
        style: 'primary',
        func: 'link',
    },
}

interface CommonButtonProps {
    label: string
    buttonType: ButtonType
    buttonStyle?: ButtonStyleKey
    buttonFunction?: ButtonFunctionKey
    buttonVariant?: ButtonVariant
    href?: string
    alertMessage?: string

    avatarSrc?: string
    avatarAlt?: string

    showChevron?: boolean
}

type AlertButtonProps = CommonButtonProps & {
    buttonType: 'alert'
    alertMessage: string
}

type NavButtonProps = CommonButtonProps & {
    buttonType: 'nav'
    href: string
}

type SubNavButtonProps = CommonButtonProps & {
    buttonType: 'subnav'
    href: string
}

type LoginButtonProps = CommonButtonProps & {
    buttonType: 'login'
}

type DonateButtonProps = CommonButtonProps & {
    buttonType: 'donate'
}

type AccountButtonProps = CommonButtonProps & {
    buttonType: 'account'
    href: string
    avatarSrc?: string
}

type CustomButtonProps = CommonButtonProps & {
    buttonType: 'custom'
}

export type ModularButtonProps =
    | AlertButtonProps
    | NavButtonProps
    | SubNavButtonProps
    | LoginButtonProps
    | DonateButtonProps
    | AccountButtonProps
    | CustomButtonProps

export function ModularButton(props: ModularButtonProps) {
    const {
        label,
        buttonType,
        buttonStyle,
        buttonFunction,
        buttonVariant = 'default',
        href,
        alertMessage,
        avatarSrc,
        avatarAlt,
    } = props

    const typeDefaults = buttonTypeConfig[buttonType]

    const styleKey: ButtonStyleKey =
        buttonStyle ?? typeDefaults.style ?? 'primary'

    const funcKey: ButtonFunctionKey =
        buttonFunction ?? typeDefaults.func ?? 'alert'

    const resolvedHref =
        href ?? ('href' in typeDefaults ? typeDefaults.href : undefined)

    const resolvedAlertMessage =
        alertMessage ??
        ('alertMessage' in typeDefaults
            ? typeDefaults.alertMessage
            : undefined) ??
        `You clicked "${label}"`

    const isAccount = buttonType === 'account'
    const isNav = buttonType === 'nav'
    const isLongVariant = buttonVariant === 'long'
    const showNavChevron =
        isNav && (isLongVariant || props.showChevron === true)
    const isAccountCompact = isAccount && !isLongVariant
    const hasAvatar = typeof avatarSrc === 'string' && avatarSrc.length > 0

    const styleClass = isAccountCompact
        ? styles.accountCompact
        : styles[styleKey]

    const variantClass = isLongVariant
        ? styles.longVariant
        : styles.defaultVariant

    const navClass = showNavChevron ? styles.navButton : ''
    const longNavClass = showNavChevron ? styles.longNavButton : ''
    const className = [
        styles.buttonBase,
        styleClass,
        variantClass,
        navClass,
        longNavClass,
    ]
        .filter(Boolean)
        .join(' ')

    const handleClick = () => {
        switch (funcKey) {
            case 'alert':
                alert(resolvedAlertMessage)
                break
            case 'link':
                if (resolvedHref) window.location.href = resolvedHref
                break
        }
    }

    const content =
        isAccount && hasAvatar ? (
            isLongVariant ? (
                <span className={styles.accountContent}>
                    <Image
                        src={avatarSrc}
                        alt={avatarAlt ?? 'Account avatar'}
                        width={40}
                        height={40}
                        className={styles.accountAvatar}
                        style={{ objectFit: 'cover' }}
                    />
                    <span>{label}</span>
                </span>
            ) : (
                <Image
                    src={avatarSrc}
                    alt={avatarAlt ?? 'Account avatar'}
                    width={52}
                    height={52}
                    className={styles.accountAvatarSolo}
                    style={{ objectFit: 'cover' }}
                />
            )
        ) : (
            <span className={styles.buttonContent}>
                <span className={styles.buttonLabel}>{label}</span>
                {showNavChevron ? (
                    <span className={styles.navAffordance} aria-hidden="true" />
                ) : null}
            </span>
        )

    return (
        <button type="button" onClick={handleClick} className={className}>
            {content}
        </button>
    )
}
