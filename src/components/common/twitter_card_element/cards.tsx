'use client'

import styles from './cards.module.css'
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
import { motion, TargetAndTransition, Transition } from 'motion/react'
import Image from 'next/image'
import { useState } from 'react'
import type React from 'react'

interface MotionProps {
    initial?: TargetAndTransition
    animate?: TargetAndTransition
    transition?: Transition
}

interface ImageProps {
    position?: string
    zoom?: number
    offsetX?: number // percent
    offsetY?: number // percent
}

export interface TiltProps {
    className?: string
    disabled?: boolean
    strength?: number
    rotateMax?: number
    zRotate?: number
    hoverScale?: number
}

export interface MessageData {
    username: string
    nameColor?: string
    text: string
    image?: string
    avatar: string
    avatarRounded?: boolean
    motionProps?: MotionProps
    imageProps?: ImageProps

    tiltProps?: TiltProps
}

export function Message({
    avatar,
    text,
    username,
    motionProps,
    avatarRounded = true,
    nameColor,
    image,
    imageProps,
}: {
    avatar: string
    text: string
    username: string
    motionProps?: MotionProps
    avatarRounded?: boolean
    nameColor?: string
    image?: string
    imageProps?: ImageProps
}) {
    const [clickedHeart, setClickedHeart] = useState(false)
    const [clickedBubble, setClickedBubble] = useState(false)
    const [clickedShare, setClickedShare] = useState(false)

    const imgPosition = imageProps?.position ?? 'center'
    const imgZoom = imageProps?.zoom ?? 1
    const imgOffsetX = imageProps?.offsetX ?? 0
    const imgOffsetY = imageProps?.offsetY ?? 0

    return (
        <motion.div
            className={styles.cardOuter}
            style={{
                willChange: 'opacity, transform',
                transform: 'translateZ(0)',
            }}
            initial={{ opacity: 0, scale: 0, ...(motionProps?.initial ?? {}) }}
            animate={{ opacity: 1, scale: 1, ...(motionProps?.animate ?? {}) }}
            transition={{
                ease: 'backInOut',
                ...(motionProps?.transition ?? {}),
            }}
        >
            <div className={styles.card}>
                <div className={styles.cardTop}>
                    <div className={styles.userRow}>
                        <Image
                            src={avatar}
                            alt={username}
                            width={0}
                            height={0}
                            unoptimized
                            className={
                                avatarRounded
                                    ? `${styles.avatar} ${styles.avatarRounded}`
                                    : styles.avatar
                            }
                        />

                        <p
                            className={styles.username}
                            style={{ color: nameColor }}
                        >
                            {username}
                        </p>
                    </div>

                    <p className={styles.text}>{text}</p>
                </div>

                {image && (
                    <div className={styles.mediaPad}>
                        <div className={styles.mediaFrame}>
                            <Image
                                src={image}
                                alt={username}
                                fill
                                sizes="100%"
                                className={styles.media}
                                style={{
                                    objectPosition: imgPosition,
                                    transform: `translate(${imgOffsetX}%, ${imgOffsetY}%) scale(${imgZoom})`,
                                    transformOrigin: imgPosition,
                                }}
                            />
                        </div>
                    </div>
                )}

                <div className={styles.actions}>
                    <button
                        type="button"
                        className={styles.actionBtn}
                        onClick={() => setClickedBubble((v) => !v)}
                        aria-pressed={clickedBubble}
                        aria-label="Comment"
                    >
                        {clickedBubble ? (
                            <SolidChatBubbleLeftRightIcon
                                className={`${styles.icon} ${styles.iconBubbleOn}`}
                            />
                        ) : (
                            <ChatBubbleLeftRightIcon className={styles.icon} />
                        )}
                    </button>

                    <button
                        type="button"
                        className={styles.actionBtn}
                        onClick={() => setClickedShare((v) => !v)}
                        aria-pressed={clickedShare}
                        aria-label="Share"
                    >
                        {clickedShare ? (
                            <SolidArrowUpOnSquareIcon
                                className={`${styles.icon} ${styles.iconShareOn}`}
                            />
                        ) : (
                            <ArrowUpOnSquareIcon className={styles.icon} />
                        )}
                    </button>

                    <button
                        type="button"
                        className={styles.actionBtn}
                        onClick={() => setClickedHeart((v) => !v)}
                        aria-pressed={clickedHeart}
                        aria-label="Like"
                    >
                        {clickedHeart ? (
                            <SolidHeartIcon
                                className={`${styles.icon} ${styles.iconHeartOn}`}
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
