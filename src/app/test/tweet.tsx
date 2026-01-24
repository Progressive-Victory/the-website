'use client'

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
import type React from 'react'
import { useEffect, useMemo, useState } from 'react'

const avatarImage = '/images/PV_Pride_Logo.png'

function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n))
}

function useViewport() {
    const [viewportPx, setViewportPx] = useState(0)
    const [rootFontPx, setRootFontPx] = useState(16)

    useEffect(() => {
        const read = () => {
            setViewportPx(window.innerWidth)
            const fs = window.getComputedStyle(
                document.documentElement
            ).fontSize
            const parsed = Number.parseFloat(fs)
            setRootFontPx(Number.isFinite(parsed) && parsed > 0 ? parsed : 16)
        }

        read()
        window.addEventListener('resize', read)
        return () => window.removeEventListener('resize', read)
    }, [])

    const viewportRem = rootFontPx > 0 ? viewportPx / rootFontPx : 0

    return { viewportPx, viewportRem, rootFontPx }
}

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

    const { viewportRem } = useViewport()

    const cardsPerRow = useMemo(() => {
        let n = 1
        if (viewportRem >= 80) n = 3
        else if (viewportRem >= 55) n = 2
        else n = 1
        return clamp(n, 1, messages.length)
    }, [viewportRem, messages.length])

    const paddingRem = 1
    const gapRem = 1

    const totalPaddingRem = paddingRem * 2
    const totalGapsRem = gapRem * Math.max(0, cardsPerRow - 1)

    return (
        <div style={{ zIndex: 1 }}>
            <div
                style={{
                    color: '#ffffff',
                    paddingBlock: '3rem',
                    position: 'relative',
                    alignItems: 'center',
                    alignContent: 'center',
                    textAlign: 'center',
                }}
            >
                <h1
                    style={{
                        fontSize: '2rem',
                        lineHeight: '2rem',
                        fontWeight: '700',
                        color: '#ffffff',
                    }}
                >
                    Welcome to{' '}
                    <span style={{ color: '#09223a' }}>
                        Progressive Victory
                    </span>{' '}
                    the Online Community for Political Action.
                </h1>
                <h2
                    style={{
                        margin: '2rem 0',
                        fontSize: '1rem',
                        lineHeight: '1.5rem',
                        fontWeight: '500',
                        color: '#ffffff',
                    }}
                >
                    Find like minded people, share ideas, and engage in
                    meaningful political action. Get involved today!
                </h2>

                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '1rem',
                    }}
                >
                    <Link
                        href="/about"
                        style={{
                            borderRadius: '9999px',
                            paddingBlock: '0.5rem',
                            paddingInline: '1.5rem',
                            fontSize: '1rem',
                            fontWeight: 700,
                            color: '#ffffff',
                            backgroundColor: '#09223a',
                            transitionProperty: 'all',
                            transitionDuration: '200ms',
                            transitionTimingFunction: 'ease-in-out',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#ffffff'
                            e.currentTarget.style.color = '#ce3728'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#09223a'
                            e.currentTarget.style.color = '#ffffff'
                        }}
                    >
                        Learn More
                    </Link>

                    <Link
                        href="/volunteer"
                        style={{
                            borderRadius: '9999px',
                            paddingBlock: '0.5rem',
                            paddingInline: '1.35rem',
                            fontSize: '1rem',
                            fontWeight: 700,
                            color: '#ffffff',
                            backgroundColor: '#ce3728',
                            transitionProperty: 'all',
                            transitionDuration: '200ms',
                            transitionTimingFunction: 'ease-in-out',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#ffffff'
                            e.currentTarget.style.color = '#CE3728'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#ce3728'
                            e.currentTarget.style.color = '#ffffff'
                        }}
                    >
                        Join
                    </Link>
                </div>
            </div>

            <div
                style={
                    {
                        display: 'flex',
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        justifyContent: 'center',

                        padding: `${paddingRem}rem`,
                        gap: `${gapRem}rem`,

                        '--row-width': `calc(100dvw - ${totalPaddingRem}rem - ${totalGapsRem}rem)`,

                        '--cards-per-row': cardsPerRow,

                        '--card-width': `calc(var(--row-width) / var(--cards-per-row))`,
                    } as React.CSSProperties
                }
            >
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
        <div
            style={{
                flex: '0 0 calc(var(--card-width))',
                width: 'calc(var(--card-width))',
                boxSizing: 'border-box',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',

                    gap: 'calc(var(--card-width) / 50)',

                    width: '100%',
                    borderRadius: 'calc(var(--card-width) / 50)',
                    background: '#ffffff',
                    padding: 'calc(var(--card-width) / 40)',
                    boxShadow:
                        '0 1rem 1.25rem -0.25rem rgba(0,0,0,0.1), 0 0.4rem 0.5rem -0.3rem rgba(0,0,0,0.1)',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'calc(var(--card-width) / 50)',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}
                    >
                        <Image
                            src={avatar}
                            alt={username}
                            width={0}
                            height={0}
                            unoptimized
                            style={{
                                width: 'calc(var(--card-width) / 12)',
                                height: 'calc(var(--card-width) / 12)',
                                borderRadius: avatarRounded ? '9999px' : '0',
                                objectFit: 'cover',
                            }}
                        />

                        <p
                            style={{
                                fontSize: 'calc(var(--card-width) / 30)',
                                paddingLeft: 'calc(var(--card-width) / 30)',
                                color: nameColor,
                                fontWeight: '700',
                            }}
                        >
                            {username}
                        </p>
                    </div>

                    <p style={{ fontSize: 'calc(var(--card-width) / 35)' }}>
                        {text}
                    </p>
                </div>

                {image && (
                    <div
                        style={{
                            paddingBlock: 'calc(var(--card-width) / 100)',
                        }}
                    >
                        <div
                            style={{
                                position: 'relative',
                                aspectRatio: '16 / 9',
                                borderRadius: 'calc(var(--card-width) / 50)',
                                overflow: 'hidden',
                            }}
                        >
                            <Image
                                src={image}
                                alt={username}
                                fill
                                sizes="100%"
                                style={{
                                    objectFit: 'cover',
                                    objectPosition: imagePosition,
                                    transform: `translate(${imageOffsetX}%, ${imageOffsetY}%) scale(${imageZoom})`,
                                    transformOrigin: imagePosition,
                                }}
                            />
                        </div>
                    </div>
                )}

                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'end',
                        gap: 'calc(var(--card-width) / 35)',
                    }}
                >
                    <button
                        type="button"
                        style={{
                            width: 'calc(var(--card-width) / 20)',
                            height: 'calc(var(--card-width) / 20)',
                            cursor: 'pointer',
                        }}
                        onClick={() => setClickedBubble((v) => !v)}
                        aria-pressed={clickedBubble}
                        aria-label="Comment"
                    >
                        {clickedBubble ? (
                            <SolidChatBubbleLeftRightIcon
                                style={{
                                    width: 'calc(var(--card-width) / 22)',
                                    color: '#3b82f6',
                                }}
                            />
                        ) : (
                            <ChatBubbleLeftRightIcon
                                style={{
                                    width: 'calc(var(--card-width) / 22)',
                                }}
                            />
                        )}
                    </button>

                    <button
                        type="button"
                        style={{
                            width: 'calc(var(--card-width) / 22)',
                            height: 'calc(var(--card-width) / 22)',
                            cursor: 'pointer',
                        }}
                        onClick={() => setClickedShare((v) => !v)}
                        aria-pressed={clickedShare}
                        aria-label="Share"
                    >
                        {clickedShare ? (
                            <SolidArrowUpOnSquareIcon
                                style={{
                                    width: 'calc(var(--card-width) / 22)',
                                    color: '#22c55e',
                                }}
                            />
                        ) : (
                            <ArrowUpOnSquareIcon
                                style={{
                                    width: 'calc(var(--card-width) / 22)',
                                }}
                            />
                        )}
                    </button>

                    <button
                        type="button"
                        style={{
                            width: 'calc(var(--card-width) / 22)',
                            height: 'calc(var(--card-width) / 22)',
                            cursor: 'pointer',
                        }}
                        onClick={() => setClickedHeart((v) => !v)}
                        aria-pressed={clickedHeart}
                        aria-label="Like"
                    >
                        {clickedHeart ? (
                            <SolidHeartIcon
                                style={{
                                    width: 'calc(var(--card-width) / 22)',
                                    color: '#ef4444',
                                }}
                            />
                        ) : (
                            <HeartIcon
                                style={{
                                    width: 'calc(var(--card-width) / 22)',
                                }}
                            />
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
