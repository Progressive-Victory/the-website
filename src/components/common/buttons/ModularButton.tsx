'use client'

import { AccountButton } from './button_types/AccountButton'
import { AlertButton } from './button_types/AlertButton'
import { CustomButton } from './button_types/CustomButton'
import { DonateButton } from './button_types/DonateButton'
import { LoginButton } from './button_types/LoginButton'
import { MobileNavButton } from './button_types/MobileNavButton'
import { NavButton } from './button_types/NavButton'
import { SubNavButton } from './button_types/SubNavButton'
import type { BaseVisualProps, ButtonStyleKey } from './types'
import type React from 'react'

export type ButtonType =
    | 'custom'
    | 'alert'
    | 'nav'
    | 'subnav'
    | 'mobileNav'
    | 'login'
    | 'donate'
    | 'account'

export type ModularButtonProps =
    | ({
          buttonType: 'alert'
          alertMessage: string
          buttonStyle?: ButtonStyleKey
      } & BaseVisualProps)
    | ({
          buttonType: 'nav'
          href: string
          buttonStyle?: ButtonStyleKey
      } & BaseVisualProps)
    | ({
          buttonType: 'subnav'
          href: string
          buttonStyle?: ButtonStyleKey
      } & BaseVisualProps)
    | ({
          buttonType: 'mobileNav'
          href: string
          buttonStyle?: ButtonStyleKey
      } & BaseVisualProps)
    | ({
          buttonType: 'login'
          href: string
          buttonStyle?: ButtonStyleKey
      } & BaseVisualProps)
    | ({
          buttonType: 'donate'
          buttonStyle?: ButtonStyleKey
      } & BaseVisualProps)
    | ({
          buttonType: 'account'
          href: string
          avatarSrc?: string
          avatarAlt?: string
          buttonStyle?: ButtonStyleKey
      } & BaseVisualProps)
    | ({
          buttonType: 'custom'
          onClick: () => void
          renderContent?: (args: { showNavChevron: boolean }) => React.ReactNode
          buttonStyle?: ButtonStyleKey
      } & BaseVisualProps)

export function ModularButton(props: ModularButtonProps) {
    switch (props.buttonType) {
        case 'alert':
            return (
                <AlertButton
                    label={props.label}
                    alertMessage={props.alertMessage}
                    styleKey={props.buttonStyle}
                    buttonVariant={props.buttonVariant}
                    showChevron={props.showChevron}
                    className={props.className}
                    disabled={props.disabled}
                />
            )

        case 'nav':
            return (
                <NavButton
                    label={props.label}
                    href={props.href}
                    styleKey={props.buttonStyle}
                    buttonVariant={props.buttonVariant}
                    showChevron={props.showChevron}
                    className={props.className}
                    disabled={props.disabled}
                />
            )

        case 'subnav':
            return (
                <SubNavButton
                    label={props.label}
                    href={props.href}
                    styleKey={props.buttonStyle}
                    buttonVariant={props.buttonVariant}
                    showChevron={props.showChevron}
                    className={props.className}
                    disabled={props.disabled}
                />
            )

        case 'mobileNav':
            return (
                <MobileNavButton
                    label={props.label}
                    href={props.href}
                    styleKey={props.buttonStyle}
                    buttonVariant={props.buttonVariant}
                    showChevron={props.showChevron}
                    className={props.className}
                    disabled={props.disabled}
                />
            )

        case 'login':
            return (
                <LoginButton
                    label={props.label}
                    href={props.href}
                    styleKey={props.buttonStyle}
                    buttonVariant={props.buttonVariant}
                    showChevron={props.showChevron}
                    className={props.className}
                    disabled={props.disabled}
                />
            )

        case 'donate':
            return (
                <DonateButton
                    label={props.label}
                    styleKey={props.buttonStyle}
                    buttonVariant={props.buttonVariant}
                    showChevron={props.showChevron}
                    className={props.className}
                    disabled={props.disabled}
                />
            )

        case 'account':
            return (
                <AccountButton
                    label={props.label}
                    href={props.href}
                    avatarSrc={props.avatarSrc}
                    avatarAlt={props.avatarAlt}
                    styleKey={props.buttonStyle}
                    buttonVariant={props.buttonVariant}
                    showChevron={props.showChevron}
                    className={props.className}
                    disabled={props.disabled}
                />
            )

        case 'custom':
            return (
                <CustomButton
                    label={props.label}
                    onClick={props.onClick}
                    renderContent={props.renderContent}
                    styleKey={props.buttonStyle}
                    buttonVariant={props.buttonVariant}
                    showChevron={props.showChevron}
                    className={props.className}
                    disabled={props.disabled}
                />
            )
    }
}
