'use client'

import styles from './card.module.css'
import {
    HeartIcon,
    ChatBubbleLeftRightIcon,
    ArrowUpOnSquareIcon,
} from '@heroicons/react/24/outline'
import {
    HeartIcon as SolidHeartIcon,
    ChatBubbleLeftRightIcon as SolidChatBubbleLeftRightIcon,
    ArrowUpOnSquareIcon as SolidArrowUpOnSquareIcon,
} from '@heroicons/react/24/solid'
import {
    motion,
    TargetAndTransition,
    Transition,
    useSpring,
    useTransform,
} from 'motion/react'
import Image from 'next/image'
import type React from 'react'
import { JSX, useState } from 'react'

export function Message({
    avatar,
    text,
    username,
    motionProps,
    avatarRounded = true,
    className,
    nameColor,
    image,
    children,
    botLeftContent,
    botDivider = false,
}: {
    avatar: string
    text: string
    username: string
    motionProps?: {
        initial?: TargetAndTransition
        animate?: TargetAndTransition
        transition?: Transition
    }
    avatarRounded?: boolean
    className?: string
    nameColor?: string
    image?: string
    children?: JSX.Element
    botLeftContent?: JSX.Element
    botDivider?: boolean
}) {
    const [clickedHeart, setClickedHeart] = useState(false)
    const [clickedBubble, setClickedBubble] = useState(false)
    const [clickedShare, setClickedShare] = useState(false)

    const rootClassName = [styles.message, className].filter(Boolean).join(' ')

    return (
        <motion.div
            className={rootClassName}
            style={{
                willChange: 'opacity, transform',
                transform: 'translateZ(0)',
            }}
            initial={{ opacity: 0, scale: 0, ...motionProps?.initial }} // Start position: off-screen to the right
            animate={{ opacity: 1, scale: 1, ...motionProps?.animate }} // End position: visible and on-screen
            transition={{ ease: 'backInOut', ...motionProps?.transition }}
        >
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.topRow}>
                    <div className={styles.userWrap}>
                        <Image
                            src={avatar}
                            alt={username}
                            className={
                                avatarRounded ? styles.avatarRounded : ''
                            }
                            width={38}
                            height={38}
                            unoptimized
                        />
                        <p
                            className={styles.username}
                            style={{ color: nameColor }}
                        >
                            {username}
                        </p>
                    </div>
                </div>

                <p className={styles.text}>{text}</p>
            </div>

            {image && (
                <div className={styles.mediaWrap}>
                    <Image
                        src={image}
                        alt={username}
                        className={styles.media}
                        style={{ objectPosition: '25% 25%' }}
                        fill
                        sizes="100%"
                    />
                </div>
            )}

            {/* Middle - Image */}
            {children && children}

            {botDivider && <hr className={styles.divider} />}
            {/* Bottom Row */}
            <div className={styles.bottomRow}>
                <div className={styles.bottomLeft}>
                    {botLeftContent && botLeftContent}
                </div>

                <div className={styles.actions}>
                    <button
                        type="button"
                        className={styles.action}
                        onClick={() => setClickedBubble((v) => !v)}
                        aria-pressed={clickedBubble}
                        aria-label="Comment"
                    >
                        {clickedBubble ? (
                            <SolidChatBubbleLeftRightIcon
                                className={`${styles.iconSolid} ${styles.bubbleActive}`}
                            />
                        ) : (
                            <ChatBubbleLeftRightIcon className={styles.icon} />
                        )}
                    </button>

                    <button
                        type="button"
                        className={styles.action}
                        onClick={() => setClickedShare((v) => !v)}
                        aria-pressed={clickedShare}
                        aria-label="Share"
                    >
                        {clickedShare ? (
                            <SolidArrowUpOnSquareIcon
                                className={`${styles.iconSolid} ${styles.shareActive}`}
                            />
                        ) : (
                            <ArrowUpOnSquareIcon className={styles.icon} />
                        )}
                    </button>

                    <button
                        type="button"
                        className={styles.action}
                        onClick={() => setClickedHeart((v) => !v)}
                        aria-pressed={clickedHeart}
                        aria-label="Like"
                    >
                        {clickedHeart ? (
                            <SolidHeartIcon
                                className={`${styles.iconSolid} ${styles.heartActive}`}
                            />
                        ) : (
                            <HeartIcon className={styles.icon} />
                        )}
                    </button>
                </div>
            </div>
        </motion.div>
    )
}

/**
 * TiltMessage is meant to wrap about the `<Message>` component
 */
export function TiltMessage({
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
            className={className}
            style={{
                rotateX,
                rotateY,
                transformPerspective: 1000,
            }}
            animate={{
                // rotateZ: isHovered ? -2.5 : 0,
                scale: isHovered ? 1.01 : 1,
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

function useMousePosition() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

    const handleMouseMove = (e: React.MouseEvent) => {
        setMousePosition({ x: e.clientX, y: e.clientY })
    }

    return { mousePosition, handleMouseMove }
}
