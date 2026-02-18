'use client'

import { BaseButton, BaseVisualProps } from '../../Button'
import overlayStyles from './DonateButton.module.css'
import buttonStyles from '@/components/common/buttons/Button.module.css'
import { OverlayBackdrop } from '@/components/common/overlay/OverlayBackdrop'
import useInView from '@/util/hooks/useInView'
import { AnimatePresence, motion } from 'motion/react'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

export type DonateButtonProps = BaseVisualProps

export function DonateButton(props: DonateButtonProps) {
    const { className, ...rest } = props

    const mergedClassName = [buttonStyles.prominent, className]
        .filter(Boolean)
        .join(' ')

    const [mounted, setMounted] = useState(false)
    const [open, setOpen] = useState(false)

    const openOverlay = () => {
        setMounted(true)
        requestAnimationFrame(() => setOpen(true))
    }

    const closeOverlay = () => {
        setOpen(false)
    }

    const toggleOverlay = () => {
        if (!mounted) openOverlay()
        else closeOverlay()
    }

    return (
        <div>
            <BaseButton
                {...rest}
                className={mergedClassName}
                onClick={toggleOverlay}
            />

            {mounted ? (
                <DonationOverlay
                    open={open}
                    onRequestClose={closeOverlay}
                    onExited={() => setMounted(false)}
                />
            ) : null}
        </div>
    )
}

const MEMBER_HREF = 'https://secure.actblue.com/donate/pvmember?refcode=website'
const DONATE_HREF = 'https://secure.actblue.com/donate/pvwebsite'
const MERCH_HREF = 'https://progressivevictory.myshopify.com/'

type DonationActionKey = 'single' | 'member' | 'merch'

const donationActions: {
    key: DonationActionKey
    image: string
    title: string
    description: string
    children: React.ReactNode
}[] = [
    {
        key: 'single',
        image: '/images/Halftone-Phone.webp',
        title: 'Donation',
        description: 'Select this option to make simple donations. ',
        children: (
            <BaseButton
                label="Donate"
                href={DONATE_HREF}
                className={buttonStyles.prominent}
            />
        ),
    },
    {
        key: 'member',
        image: '/images/Halftone-Handshake.webp',
        title: 'Dues Paying Member',
        description: 'Become a Dues Paying Member and get your very own PV Membership Card!',
        children: (
            <BaseButton
                label="Donate"
                href={MEMBER_HREF}
                className={buttonStyles.prominent}
            />
        ),
    },
    {
        key: 'merch',
        image: '/images/Halftone-Clipboard.webp',
        title: 'Merchandise',
        description: 'Click here to check out our merch store.',
        children: (
            <BaseButton
                label="Shop"
                href={MERCH_HREF}
                className={buttonStyles.primary}
            />
        ),
    },
]

interface DonationOverlayProps {
    open: boolean
    onRequestClose: () => void
    onExited: () => void
}

export function DonationOverlay({
    open,
    onRequestClose,
    onExited,
}: DonationOverlayProps) {
    const { inView, observe } = useInView()
    const divRef = useRef<HTMLDivElement>(null)
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        if (divRef.current) observe(divRef.current)
    }, [observe])

    useEffect(() => {
        if (inView) setVisible(true)
    }, [inView])

    useEffect(() => {
        if (!open) return
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onRequestClose()
        }
        document.addEventListener('keydown', onKeyDown)
        return () => document.removeEventListener('keydown', onKeyDown)
    }, [open, onRequestClose])

    return createPortal(
        <>
            <OverlayBackdrop
                open={open}
                onClick={onRequestClose}
                zIndex={100}
                blurPx={10}
                tintColor="rgba(0, 0, 0, 0.18)"
                lockBodyScroll={open}
            />

            <AnimatePresence onExitComplete={onExited}>
                {open ? (
                    <motion.div
                        key="donation-overlay-layer"
                        className={overlayStyles.overlayLayer}
                        onClick={onRequestClose}
                        initial={{ opacity: 0, transform: 'translateY(6px)' }}
                        animate={{ opacity: 1, transform: 'translateY(0px)' }}
                        exit={{ opacity: 0, transform: 'translateY(6px)' }}
                        transition={{
                            duration: 0.18,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                    >
                        <div className={overlayStyles.container}>
                            <div className={overlayStyles.content}>
                                <div className={overlayStyles.topBar}>
                                    <div
                                        className={
                                            overlayStyles.backButtonGuard
                                        }
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <BaseButton
                                            label="Back"
                                            onClick={onRequestClose}
                                            className={buttonStyles.secondary}
                                            aria-label="Close donation overlay"
                                            renderContent={() => (
                                                <span
                                                    className={
                                                        buttonStyles.buttonContent
                                                    }
                                                    style={{
                                                        justifyContent:
                                                            'center',
                                                        gap: '0.6rem',
                                                    }}
                                                >
                                                    <span
                                                        aria-hidden="true"
                                                        style={{
                                                            display:
                                                                'inline-flex',
                                                            alignItems:
                                                                'center',
                                                            justifyContent:
                                                                'center',
                                                            width: '1.25rem',
                                                            height: '1.25rem',
                                                        }}
                                                    >
                                                        <svg
                                                            width="20"
                                                            height="20"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                        >
                                                            <path
                                                                d="M9 10H5V6"
                                                                stroke="currentColor"
                                                                strokeWidth="2.5"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                            />
                                                            <path
                                                                d="M5 10C7.2 6.2 11.3 4.7 15.2 6.2C19.4 7.8 21.3 12.4 19.7 16.5C18.1 20.6 13.5 22.5 9.4 20.9"
                                                                stroke="currentColor"
                                                                strokeWidth="2.5"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                            />
                                                        </svg>
                                                    </span>

                                                    <span
                                                        className={
                                                            buttonStyles.buttonLabel
                                                        }
                                                    >
                                                        Back
                                                    </span>
                                                </span>
                                            )}
                                        />
                                    </div>
                                </div>

                                <div
                                    className={overlayStyles.cardsWrapper}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {visible &&
                                        donationActions.map((action, index) => (
                                            <Card
                                                key={action.title}
                                                cardKey={action.key}
                                                image={action.image}
                                                title={action.title}
                                                delay={index * 0.2}
                                                description={action.description}
                                            >
                                                {action.children}
                                            </Card>
                                        ))}
                                </div>

                                <div ref={divRef} />
                            </div>
                        </div>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </>,
        document.body
    )
}

function Card({
    cardKey,
    image,
    title,
    description,
    delay = 0,
    children,
}: {
    cardKey: 'single' | 'member' | 'merch'
    image: string
    title: string
    description: string
    delay?: number
    children: React.ReactNode
}) {
    const cardClassName =
        cardKey === 'member'
            ? `${overlayStyles.card} ${overlayStyles.memberCard}`
            : overlayStyles.card

    return (
        <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{
                duration: 1.0,
                delay,
                ease: 'backInOut',
            }}
            className={cardClassName}
        >
            <div className={overlayStyles.cardHeader}>
                <h1 className={overlayStyles.cardTitle}>{title}</h1>
                <Image src={image} alt={title} width={86} height={86} />
            </div>

            <div className={overlayStyles.cardContent}>
                <p className={overlayStyles.cardDescription}>{description}</p>
            </div>

            {cardKey === 'member' ? (
                <div
                    className={overlayStyles.preferredText}
                    aria-label="Preferred"
                >
                    Preferred
                </div>
            ) : null}

            <div className={overlayStyles.cardButton}>{children}</div>
        </motion.div>
    )
}
