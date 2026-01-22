'use client'

import styles from './hero.module.css'
import { Link, Message } from '@/components/common'
import { HalftoneBackground } from '@/components/halftone/HalftoneBackground'
import { motion, useTransform, useSpring } from 'motion/react'
import type React from 'react'
import { useState } from 'react'

const avatarImage = '/images/PV_Pride_Logo.png'

export function Hero() {
    return (
        <div className={styles.hero}>
            <HalftoneBackground />

            <div
                className={styles.blendPanel}
                style={{
                    backgroundImage: "url('/images/blend_test.png')",
                }}
            />

            <div className={styles.content}>
                <motion.div
                    style={{
                        willChange: 'opacity, transform',
                        transform: 'translateZ(0)',
                    }}
                    initial={{ y: 100, opacity: 0, scale: 0 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    transition={{ ease: 'backInOut', duration: 1, delay: 0.45 }}
                >
                    <h1 className={styles.title}>
                        Welcome to{' '}
                        <span className={styles.titleEmphasis}>
                            Progressive Victory
                        </span>{' '}
                        the Online Community for Political Action.
                    </h1>
                </motion.div>

                <motion.div
                    style={{
                        willChange: 'opacity, transform',
                        transform: 'translateZ(0)',
                    }}
                    initial={{ y: 50, opacity: 0, scale: 0 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    transition={{ ease: 'backInOut', duration: 1, delay: 0.25 }}
                >
                    <p className={styles.subtitle}>
                        Find like minded people, share ideas, and engage in
                        meaningful political action. Get involved today!
                    </p>
                </motion.div>

                <motion.div
                    style={{
                        willChange: 'opacity, transform',
                        transform: 'translateZ(0)',
                    }}
                    initial={{ y: 50, opacity: 0, scale: 0 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    transition={{
                        ease: 'backInOut',
                        duration: 0.8,
                        delay: 0.15,
                    }}
                >
                    <Link href="/volunteer" className={styles.cta}>
                        Get Involved
                    </Link>
                </motion.div>
            </div>

            <div className={styles.messages}>
                <TiltMessage className={styles.orderLastXlFirst}>
                    <Message
                        className={styles.messageCard}
                        motionProps={{
                            initial: { rotate: 20, y: 50 },
                            animate: { rotate: -5, y: 0 },
                            transition: { delay: 0.15, duration: 0.65 },
                        }}
                        avatar={avatarImage}
                        avatarRounded={false}
                        username="Progressive Victory"
                        nameColor="red"
                        text="It's all fun and games w PV members at the Katie Wilson Watch Party tonight in Seattle! Congratulations to @wilsonformayor and all the volunteers who spent months working to help her win!"
                        image="/images/PVKatieWilsonWatchParty.jpeg"
                    />
                </TiltMessage>

                <TiltMessage className={styles.messageMid}>
                    <Message
                        className={styles.messageCard}
                        motionProps={{
                            initial: { rotate: 15, y: 50 },
                            animate: { rotate: 1, y: 0 },
                            transition: { delay: 0.65, duration: 0.65 },
                        }}
                        avatar={avatarImage}
                        avatarRounded={false}
                        username="Progressive Victory"
                        nameColor="red"
                        text="Built by the internet, for America. Progressive Victory is a new kind of political institution: seamlessly marrying the electoral impact and volunteer power of traditional progressive organizations with the culture and community of digital third places."
                    />
                </TiltMessage>

                <TiltMessage className={styles.orderFirstXlLast}>
                    <Message
                        className={styles.messageCard}
                        motionProps={{
                            initial: { rotate: 30, y: 50 },
                            animate: { rotate: 6, y: 0 },
                            transition: { delay: 0.3, duration: 0.9 },
                        }}
                        avatar="/images/sam_twitter_photo.jpeg"
                        image="/images/sam.jpg"
                        username="Sam Dryzmala"
                        nameColor="purple"
                        text="I founded Progressive Victory with the dream of creating a political action community that comes together to get progressive policies & candidates the attention they deserve!"
                    />
                </TiltMessage>
            </div>
        </div>
    )
}

function useMousePosition() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

    const handleMouseMove = (e: React.MouseEvent) => {
        setMousePosition({ x: e.clientX, y: e.clientY })
    }

    return { mousePosition, handleMouseMove }
}

function TiltMessage({
    children,
    className,
}: {
    children: React.ReactNode
    className?: string
}) {
    const [isHovered, setIsHovered] = useState(false)
    const [canTilt, setCanTilt] = useState(false)
    const [elementPosition, setElementPosition] = useState({
        left: 0,
        top: 0,
        width: 0,
        height: 0,
    })
    const { mousePosition, handleMouseMove } = useMousePosition()

    // tilt
    const tiltX = useSpring(0, { stiffness: 300, damping: 50 })
    const tiltY = useSpring(0, { stiffness: 300, damping: 50 })

    const rotateX = useTransform(tiltY, [-1, 1], [-10, 10])
    const rotateY = useTransform(tiltX, [-1, 1], [-10, 10])

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
        setCanTilt(false)
        tiltX.set(0)
        tiltY.set(0)
    }

    // tilt when rotation is done
    if (isHovered && canTilt) {
        const x =
            (mousePosition.x - elementPosition.left) / elementPosition.width
        const y =
            (mousePosition.y - elementPosition.top) / elementPosition.height

        tiltX.set((x - 0.5) * 0.5)
        tiltY.set((y - 0.5) * -0.5)
    }

    return (
        <motion.div
            className={[styles.tilt, className].filter(Boolean).join(' ')}
            style={{
                rotateX,
                rotateY,
                transformPerspective: 1000,
            }}
            animate={{
                rotateZ: isHovered ? -2.5 : 0,
                scale: isHovered ? 1.02 : 1,
            }}
            transition={{ duration: 0.2 }}
            onAnimationComplete={() => {
                if (isHovered) setCanTilt(true) // tilt after rotation
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
        >
            {children}
        </motion.div>
    )
}
