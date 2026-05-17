'use client'

import styles from './DropdownOverlay.module.css'
import { forwardRef } from 'react'
import { FiX } from 'react-icons/fi'

export interface DropdownOverlayProps
    extends React.HTMLAttributes<HTMLDivElement> {
    header?: React.ReactNode
    label?: React.ReactNode
    onClose?: () => void
    body?: React.ReactNode
    footer?: React.ReactNode
    footerButtonLabel?: React.ReactNode
    footerButtonOnClick?: () => void
    footerButtonDisabled?: boolean
    headerClassName?: string
    closeButtonClassName?: string
    bodyClassName?: string
    footerClassName?: string
    footerButtonClassName?: string
}

export const DropdownOverlay = forwardRef<HTMLDivElement, DropdownOverlayProps>(
    function DropdownOverlay(
        {
            header,
            label,
            onClose,
            body,
            footer,
            footerButtonLabel,
            footerButtonOnClick,
            footerButtonDisabled,
            headerClassName,
            closeButtonClassName,
            bodyClassName,
            footerClassName,
            footerButtonClassName,
            className,
            children,
            ...props
        },
        ref
    ) {
        const shellClassName = [styles.shell, className].filter(Boolean).join(' ')
        const headerClasses = [styles.header, headerClassName]
            .filter(Boolean)
            .join(' ')
        const bodyClasses = [styles.body, bodyClassName].filter(Boolean).join(' ')
        const footerClasses = [styles.footer, footerClassName]
            .filter(Boolean)
            .join(' ')
        const footerButtonClasses = [styles.footerButton, footerButtonClassName]
            .filter(Boolean)
            .join(' ')
        const closeClasses = [styles.closeButton, closeButtonClassName]
            .filter(Boolean)
            .join(' ')

        return (
            <div ref={ref} className={shellClassName} {...props}>
                {header ? (
                    <div className={headerClasses}>{header}</div>
                ) : label ? (
                    <div className={headerClasses}>
                        <span className={styles.title}>{label}</span>
                        <button
                            type="button"
                            className={closeClasses}
                            onClick={onClose}
                            aria-label="Close overlay"
                        >
                            <FiX size={16} aria-hidden="true" />
                        </button>
                    </div>
                ) : null}
                {body ? <div className={bodyClasses}>{body}</div> : null}
                {footer || footerButtonLabel ? (
                    <div className={footerClasses}>
                        {footer}
                        {footerButtonLabel ? (
                            <button
                                type="button"
                                className={footerButtonClasses}
                                onClick={footerButtonOnClick}
                                disabled={footerButtonDisabled}
                            >
                                {footerButtonLabel}
                            </button>
                        ) : null}
                    </div>
                ) : null}
                {children}
            </div>
        )
    }
)
