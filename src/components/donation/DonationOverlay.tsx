'use client'

import { BaseButton } from '../common/buttons'
import styles from './DonationOverlay.module.css'
import buttonStyles from '@/components/common/buttons/Button.module.css'
import useInView from '@/util/hooks/useInView'
import { motion } from 'motion/react'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

const DONATE_HREF = 'https://secure.actblue.com/donate/pvwebsite'
const MERCH_HREF = 'https://progressivevictory.myshopify.com/'

const donationActions = [
    {
        image: '/images/Halftone-Phone.webp',
        title: 'Membership',
        description: 'placeholder text for membership',
        children: (
            <BaseButton
                label="Join"
                href={DONATE_HREF}
                className={buttonStyles.prominent}
            />
        ),
    },
    {
        image: '/images/Halftone-Clipboard.webp',
        title: 'One time Donation',
        description: 'placeholder text for one time donation',
        children: (
            <BaseButton
                label="Donate"
                href={DONATE_HREF}
                className={buttonStyles.prominent}
            />
        ),
    },
    {
        image: '/images/Halftone-Handshake.webp',
        title: 'Merchandise',
        description: 'placeholder text for Merchandise',
        children: (
            <BaseButton
                label="Shop"
                href={MERCH_HREF}
                className={buttonStyles.prominent}
            />
        ),
    },
]

interface DonationOverlayProps {
    handleShowOverlay: () => void
}

export function DonationOverlay({ handleShowOverlay }: DonationOverlayProps) {
    const { inView, observe } = useInView()
    const divRef = useRef<HTMLDivElement>(null)
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        if (divRef.current) observe(divRef.current)
    }, [observe])

    useEffect(() => {
        if (inView) setVisible(true)
    }, [inView])

    return createPortal(
        <div className={styles.overlay} onClick={handleShowOverlay}>
            <div
                className={styles.container}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={styles.closeButtonWrapper}>
                    <BaseButton
                        label="×"
                        onClick={handleShowOverlay}
                        className={buttonStyles.plain}
                        aria-label="Close donation overlay"
                    />
                </div>

                <div className={styles.cardsWrapper}>
                    {visible &&
                        donationActions.map((action, index) => (
                            <Card
                                key={action.title}
                                image={action.image}
                                title={action.title}
                                delay={index * 0.2}
                                description={action.description}
                            >
                                {action.children}
                            </Card>
                        ))}
                </div>
                <div className={styles.bottomContainerButtons}>
                    <BaseButton
                        label="button 1"
                        href={DONATE_HREF}
                        className={buttonStyles.prominent}
                    />
                    <BaseButton
                        label="button 2"
                        href={MERCH_HREF}
                        className={buttonStyles.secondary}
                    />
                </div>

                <div ref={divRef} />
            </div>
        </div>,
        document.body
    )
}

function Card({
    image,
    title,
    description,
    delay = 0,
    children,
}: {
    image: string
    title: string
    description: string
    delay?: number
    children: React.ReactNode
}) {
    return (
        <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{
                duration: 1.0,
                delay,
                ease: 'backInOut',
            }}
            className={styles.card}
        >
            <div className={styles.cardHeader}>
                <h1 className={styles.cardTitle}>{title}</h1>
                <Image src={image} alt={title} width={86} height={86} />
            </div>

            <div className={styles.cardContent}>
                <p className={styles.cardDescription}>{description}</p>
            </div>

            <div className={styles.cardButton}>{children}</div>
        </motion.div>
    )
}
