'use client'

import { MembershipBulletPoints } from './MembershipBulletPoints'
import MembershipCardFront from './MembershipCardFront'
import styles from './membership.module.css'
import { BaseButton } from '@/components/common/buttons/Button'
import buttonStyles from '@/components/common/buttons/Button.module.css'
import { useCurrentUser, useInView } from '@/util/hooks'
import { motion, useSpring, useTransform } from 'motion/react'
import Image, { StaticImageData } from 'next/image'
import React, { useState, useRef, useEffect } from 'react'

interface CardProps {
    dynamic?: boolean
    frontImage?: string | StaticImageData
    backImage: string | StaticImageData
}

function InteractiveThreeCard({
    dynamic = false,
    frontImage,
    backImage,
}: CardProps) {
    const [isHovered, setIsHovered] = useState(false)
    const [elementPosition, setElementPosition] = useState({
        left: 0,
        top: 0,
        width: 0,
        height: 0,
    })

    const tiltX = useSpring(0, { stiffness: 500, damping: 300 })
    const tiltY = useSpring(0, { stiffness: 500, damping: 300 })
    const flipSpring = useSpring(0, { stiffness: 300, damping: 30 })

    const rotateX = useTransform(tiltY, [-1, 1], [-15, 15])
    const rotateY = useTransform<number, number>(
        [tiltX, flipSpring],
        ([x, flip]) => x * 15 + flip
    )

    const handleMouseEnter = (e: React.MouseEvent) => {
        setIsHovered(true)
        const rect = e.currentTarget.getBoundingClientRect()
        setElementPosition({
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height,
        })
    }

    const handleMouseLeave = () => {
        setIsHovered(false)
        tiltX.set(0)
        tiltY.set(0)
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isHovered) return
        const x = e.clientX - elementPosition.left
        const y = e.clientY - elementPosition.top
        const centerX = elementPosition.width / 2
        const centerY = elementPosition.height / 2

        const normX = (x - centerX) / centerX
        const normY = (y - centerY) / centerY

        tiltX.set(normX)
        tiltY.set(normY * -1)
    }

    const handleClick = () => {
        const isCurrentlyFlipped = flipSpring.get() === 180
        flipSpring.set(isCurrentlyFlipped ? 0 : 180)
    }

    return (
        <div className={styles.cardOuter}>
            <motion.div
                className={styles.cardStage}
                style={{
                    perspective: 1000,
                    transformStyle: 'preserve-3d',
                }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onMouseMove={handleMouseMove}
                onClick={handleClick}
                whileTap={{ scale: 0.95 }}
                animate={{ scale: isHovered ? 1.03 : 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
                <motion.div
                    className={styles.cardInner}
                    style={{
                        rotateX,
                        rotateY,
                        transformStyle: 'preserve-3d',
                    }}
                >
                    <motion.div
                        className={styles.cardFace}
                        style={{
                            backfaceVisibility: 'hidden',
                            transform: 'translateZ(1px)',
                        }}
                    >
                        {!dynamic && frontImage ? (
                            <Image
                                src={frontImage}
                                alt="Front content"
                                fill
                                className={styles.cardImage}
                                priority
                                sizes="500px"
                                quality={100}
                                unoptimized
                            />
                        ) : (
                            <MembershipCardFront />
                        )}
                    </motion.div>

                    <motion.div
                        className={styles.cardFace}
                        style={{
                            backfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg) translateZ(1px)',
                        }}
                    >
                        <Image
                            src={backImage}
                            alt="Back content"
                            fill
                            className={styles.cardImage}
                            priority
                            sizes="500px"
                            quality={100}
                            unoptimized
                        />
                    </motion.div>

                    <div className={styles.cardOverlay}>
                        <div className={styles.cardBorder} />
                    </div>
                </motion.div>
            </motion.div>
        </div>
    )
}

export default InteractiveThreeCard

// safe logs <3
export function safeLogError(err: unknown, prefix = '') {
    if (err instanceof Error) {
        console.error(prefix, err)
    } else {
        const safeMessage =
            typeof err === 'object' && err !== null
                ? JSON.stringify(err)
                : String(err)
        console.error(prefix, safeMessage)
    }
}

export function MemberBanner() {
    const { inView, observe } = useInView()
    const containerRef = useRef<HTMLDivElement>(null)
    const [visible, setVisible] = useState<boolean>(false)
    const loggedInUser = useCurrentUser()
    const discordId = loggedInUser?.data?.discordUsers?.[0]?.id ?? null

    const donateHref = discordId
        ? `https://secure.actblue.com/donate/pvmember?refcode=Home%20Page&refcode2=${discordId}`
        : 'https://secure.actblue.com/donate/pvmember?refcode=Home%20Page'

    useEffect(() => {
        try {
            if (containerRef.current) observe(containerRef.current)
        } catch (err) {
            safeLogError(err, 'observe error:')
        }
    }, [observe])

    useEffect(() => {
        try {
            if (inView) setVisible(true)
        } catch (err) {
            safeLogError(err, 'inView effect error:')
        }
    }, [inView])

    return (
        <div className={styles.section}>
            <div className={styles.container}>
                <h1 className={styles.heading}>
                    Get Your Own Progressive Victory <br />
                    <span className={styles.headingAccent}>
                        Membership Card
                    </span>
                </h1>

                <div ref={containerRef} className={styles.contentRow}>
                    <motion.div
                        className={styles.cardColumn}
                        initial={{ opacity: 0, y: 50 }}
                        animate={visible ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                    >
                        <div className={styles.cardColumnInner}>
                            <InteractiveThreeCard
                                frontImage="/images/membercard_front.png"
                                backImage="/images/membercard_back.png"
                            />

                            <div className={styles.ctaRow}>
                                <BaseButton
                                    href={donateHref}
                                    label="Become a Member"
                                    className={`${buttonStyles.prominent} ${styles.buttonHover}`}
                                />
                            </div>
                        </div>
                    </motion.div>

                    <MembershipBulletPoints visible={visible} />
                </div>
            </div>
        </div>
    )
}
