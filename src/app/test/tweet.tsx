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
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

const avatarImage = '/images/PV_Pride_Logo.png'

export function TestPage() {
    const messages = [
        {
            username: 'Progressive Victory',
            nameColor: 'red',
            text: "It's all fun and games w PV members at the Katie Wilson Watch Party tonight in Seattle! Congratulations to @wilsonformayor and all the volunteers who spent months working to help her win!",
            image: '/images/PVKatieWilsonWatchParty.jpeg',
            avatar: avatarImage,
            avatarRounded: false,
            imagePosition: 'center center',
            imageZoom: 1.4,
            imageOffsetX: -8.5,
            imageOffsetY: 0,
        },
        {
            username: 'Progressive Victory',
            nameColor: 'red',
            text: 'Built by the internet, for America. Progressive Victory is a new kind of political institution: seamlessly marrying the electoral impact and volunteer power of traditional progressive organizations with the culture and community of digital third places.',
            avatar: avatarImage,
            avatarRounded: false,
            imagePosition: 'center center',
            imageZoom: 1,
            imageOffsetX: 0,
            imageOffsetY: 0,
        },
        {
            username: 'Sam Dryzmala',
            nameColor: 'purple',
            text: 'I founded Progressive Victory with the dream of creating a political action community that comes together to get progressive policies & candidates the attention they deserve!',
            image: '/images/sam.jpg',
            avatar: '/images/sam_twitter_photo.jpeg',
            avatarRounded: true,
            imagePosition: 'center center',
            imageZoom: 1.2,
            imageOffsetX: -5,
            imageOffsetY: 10,
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

            <div className={styles.grid}>
                {messages.map((m, i) => (
                    <Message
                        key={i}
                        username={m.username}
                        text={m.text}
                        nameColor={m.nameColor}
                        image={m.image}
                        avatar={m.avatar}
                        avatarRounded={m.avatarRounded}
                        imagePosition={m.imagePosition}
                        imageZoom={m.imageZoom}
                        imageOffsetX={m.imageOffsetX}
                        imageOffsetY={m.imageOffsetY}
                    />
                ))}
            </div>
        </div>
    )
}

export function Message({
    avatar,
    text,
    username,
    avatarRounded = true,
    nameColor,
    image,
    imagePosition = 'center',
    imageZoom = 1,
    imageOffsetX = 0,
    imageOffsetY = 0,
}: {
    avatar: string
    text: string
    username: string
    avatarRounded?: boolean
    nameColor?: string
    image?: string
    imagePosition?: string
    imageZoom?: number
    imageOffsetX?: number // percent
    imageOffsetY?: number // percent
}) {
    const [clickedHeart, setClickedHeart] = useState(false)
    const [clickedBubble, setClickedBubble] = useState(false)
    const [clickedShare, setClickedShare] = useState(false)

    return (
        <div className={styles.cardOuter}>
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
                                    objectPosition: imagePosition,
                                    transform: `translate(${imageOffsetX}%, ${imageOffsetY}%) scale(${imageZoom})`,
                                    transformOrigin: imagePosition,
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
        </div>
    )
}
