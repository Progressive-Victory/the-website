'use client'

import styles from './tweet.module.css'
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
import Link from 'next/link'
import { useState } from 'react'
import type React from 'react'

const avatarImage = '/images/PV_Pride_Logo.png'

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

interface TiltProps {
    className?: string
    disabled?: boolean
    strength?: number
    rotateMax?: number
    zRotate?: number
    hoverScale?: number
}

interface MessageData {
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

export function TestPage() {
    const messages: MessageData[] = [
        {
            username: 'Progressive Victory',

            nameColor: 'red',
            text: "It's all fun and games w PV members at the Katie Wilson Watch Party tonight in Seattle! Congratulations to @wilsonformayor and all the volunteers who spent months working to help her win!",
            image: '/images/PVKatieWilsonWatchParty.jpeg',
            avatar: avatarImage,
            avatarRounded: false,
            imageProps: {
                position: 'center center',
                zoom: 1.4,
                offsetX: -8.5,
                offsetY: 0,
            },
        },
        {
            username: 'Progressive Victory',

            nameColor: 'red',
            text: 'Built by the internet, for America. Progressive Victory is a new kind of political institution: seamlessly marrying the electoral impact and volunteer power of traditional progressive organizations with the culture and community of digital third places.',
            avatar: avatarImage,
            avatarRounded: false,
            imageProps: {
                position: 'center center',
                zoom: 1,
                offsetX: 0,
                offsetY: 0,
            },
        },
        {
            username: 'Sam Dryzmala',

            nameColor: 'purple',
            text: 'I founded Progressive Victory with the dream of creating a political action community that comes together to get progressive policies & candidates the attention they deserve!',
            image: '/images/sam.jpg',
            avatar: '/images/sam_twitter_photo.jpeg',
            avatarRounded: true,
            imageProps: {
                position: 'center center',
                zoom: 1.2,
                offsetX: -5,
                offsetY: 10,
            },
        },
    ]

    return (
        <div className={styles.page}>
            <div className={styles.hero}>
                <h1 className={styles.heroTitle}>
                    Welcome to{' '}
                    <span className={styles.heroTitleAccent}>
                        Progressive Victory
                    </span>{' '}
                    the Online Community for Political Action.
                </h1>

                <h2 className={styles.heroSubtitle}>
                    Find like minded people, share ideas, and engage in
                    meaningful political action. Get involved today!
                </h2>

                <div className={styles.heroButtons}>
                    <Link href="/about" className={styles.learnMoreBtn}>
                        Learn More
                    </Link>

                    <Link href="/volunteer" className={styles.joinBtn}>
                        Join
                    </Link>
                </div>
            </div>

            <div className={styles.row}>
                {messages.map((m, i) => (
                    <div key={m.username + i}>
                        <Message
                            username={m.username}
                            text={m.text}
                            nameColor={m.nameColor}
                            image={m.image}
                            avatar={m.avatar}
                            avatarRounded={m.avatarRounded}
                            motionProps={m.motionProps}
                            imageProps={m.imageProps}
                        />
                    </div>
                ))}
            </div>
        </div>
    )
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
