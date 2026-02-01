'use client'

import styles from './membership.module.css'
import { DonateButton } from '@/components/common/buttons/button_types/DonateButton'
import { motion, useSpring, useTransform } from 'motion/react'
import Image, { StaticImageData } from 'next/image'
import React, { useState, useRef, useEffect, useCallback } from 'react'

interface CardProps {
    frontImage: string | StaticImageData
    backImage: string | StaticImageData
}

function InteractiveThreeCard({ frontImage, backImage }: CardProps) {
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

interface BulletPointItem {
    title: string
    sub: number
    description: string
    bullet: string
}
type BulletPointProps = BulletPointItem & { delay?: number }

function BulletPoint({
    title,
    description,
    sub,
    bullet,
    delay = 0,
}: BulletPointProps) {
    return (
        <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay, ease: 'backInOut' }}
            className={styles.bulletRow}
        >
            <Image
                className={styles.bulletIcon}
                src={`/images/${bullet}`}
                alt={bullet}
                width={48}
                height={48}
                unoptimized
            />
            <div className={styles.bulletText}>
                <h3 className={styles.bulletTitle}>{title}</h3>
                <h4 className={styles.bulletSub}>${sub}/month</h4>
                <p className={styles.bulletDescription}>{description}</p>
            </div>
        </motion.div>
    )
}

const bulletPoints: BulletPointItem[] = [
    {
        title: 'Dues Paying Member',
        sub: 5,
        bullet: 'PV_DPM_Logo.png',
        description:
            'Gain your very own PV membership card, recognition at the end of our long-form content, and your very own sticker!',
    },
    {
        title: 'Premium Member',
        sub: 10,
        bullet: 'PV_DPM_Logo.png',
        description:
            'Early Access to the Progressive Victory Monthly Newsletter and priority questions during Q&As with PV staff. ',
    },
    {
        title: 'Signature Member',
        sub: 20,
        bullet: 'PV_DPM_Signature_Logo.png',
        description:
            'Exclusive text chat in the PV Discord with the Strategic Advisors and a really sick PV Baseball cap!',
    },
    {
        title: 'Inner Circle Member',
        sub: 100,
        bullet: 'PV_DPM_Inner_Circle_Logo.png',
        description:
            'The Complete Progressive Victory Merch Bundle Including A Progressive Victory Signature Mug, A Progressive Victory Waves Water Bottle, A Progressive Victory Waves Tee navy blue shirt.',
    },
]

interface UseInViewReturn {
    inView: boolean
    observe: (element: HTMLElement | null) => void
}

const useInView = (): UseInViewReturn => {
    const [inView, setInView] = useState<boolean>(false)
    const observerRef = useRef<IntersectionObserver | null>(null)

    useEffect(() => {
        if (typeof window !== 'undefined') {
            observerRef.current = new IntersectionObserver(([entry]) => {
                setInView(!!entry?.isIntersecting)
            })
        }

        return () => observerRef.current?.disconnect()
    }, [])

    const observe = useCallback((element: HTMLElement | null) => {
        if (element && observerRef.current) {
            observerRef.current.observe(element)
        }
    }, [])

    return { inView, observe }
}

// safe logs <3
function safeLogError(err: unknown, prefix = '') {
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
                                <DonateButton
                                    label="Become a Member"
                                    className={styles.buttonHover}
                                />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        className={styles.bulletsColumn}
                        initial="hidden"
                        animate={visible ? 'visible' : 'hidden'}
                    >
                        <div className={styles.bulletsOverflow}>
                            {visible &&
                                bulletPoints.map((point, index) => (
                                    <BulletPoint
                                        key={point.title}
                                        title={point.title}
                                        description={point.description}
                                        sub={point.sub}
                                        bullet={point.bullet}
                                        delay={index * 0.15 + 0.2}
                                    />
                                ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
