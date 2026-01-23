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

    const cardCount = messages.length

    const paddingRem = 1
    const gapRem = 1

    const totalPaddingRem = paddingRem * 2
    const totalGapsRem = gapRem * Math.max(0, cardCount - 1)

    return (
        <div
            style={{
                zIndex: 1,
            }}
        >
            <p
                style={{
                    width: '100%',
                    textAlign: 'center',
                    fontSize: '2.25rem',
                    fontWeight: 700,
                    color: 'white',
                    padding: '3rem',
                }}
            >
                Test <span style={{ color: '#09223a' }}>Page</span>
            </p>

            <span style={{}}>
                <div
                    style={
                        {
                            display: 'flex',
                            flexDirection: 'row',
                            '--screen-width': `calc(100dvw - ${totalPaddingRem}rem - ${totalGapsRem}rem)`,
                            '--card-count': cardCount,
                            padding: `${paddingRem}rem`,
                            gap: `${gapRem}rem`,
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
            </span>
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
        <div>
            <div //Background
                style={{
                    flexDirection: 'column',
                    gap: 'calc(var(--screen-width)/100)',
                    width: 'calc(var(--screen-width) / var(--card-count))',

                    borderRadius: 'calc(var(--screen-width)/150)',
                    background: '#ffffff',
                    padding: 'calc(var(--screen-width)/100)',
                    boxShadow:
                        '0 1rem 1.25rem -0.25rem rgba(0,0,0,0.1), 0 0.4rem 0.5rem -0.3rem rgba(0,0,0,0.1)',
                }}
            >
                <div //Card Header
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'calc(var(--screen-width)/100)',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}
                    >
                        <div>
                            <div>
                                <Image
                                    src={avatar}
                                    alt={username}
                                    width={0}
                                    height={0}
                                    unoptimized
                                    style={{
                                        width: 'calc(var(--screen-width) / 35)',
                                        borderRadius: avatarRounded
                                            ? '9999px'
                                            : '0',
                                        objectFit: 'cover',
                                    }}
                                />
                            </div>
                        </div>

                        <p
                            style={{
                                fontSize: 'calc(var(--screen-width)/95)',
                                paddingLeft: 'calc(var(--screen-width)/100)',
                                color: nameColor,
                                fontWeight: '700',
                            }}
                        >
                            {username}
                        </p>
                    </div>

                    <p
                        style={{
                            fontSize: 'calc(var(--screen-width)/100)',
                        }}
                    >
                        {text}
                    </p>
                </div>

                {image && (
                    <div
                        style={{
                            paddingBlock: 'calc(var(--screen-width) / 100)',
                        }}
                    >
                        <div
                            style={{
                                position: 'relative',
                                aspectRatio: '16 / 9',
                                borderRadius: 'calc(var(--screen-width) / 150)',
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

                <div //Card Bottom
                    style={{
                        display: 'flex',
                        justifyContent: 'end',
                        gap: 'calc(var(--screen-width) / 100)',
                    }}
                >
                    <button
                        type="button"
                        style={{
                            width: 'calc(var(--screen-width)/70)',
                            height: 'calc(var(--screen-width)/70)',
                            cursor: 'pointer',
                        }}
                        onClick={() => setClickedBubble((v) => !v)}
                        aria-pressed={clickedBubble}
                        aria-label="Comment"
                    >
                        {clickedBubble ? (
                            <SolidChatBubbleLeftRightIcon
                                style={{
                                    width: 'calc(var(--screen-width)/70)',
                                    color: '#3b82f6',
                                }}
                            />
                        ) : (
                            <ChatBubbleLeftRightIcon
                                style={{
                                    width: 'calc(var(--screen-width)/70)',
                                }}
                            />
                        )}
                    </button>

                    <button
                        type="button"
                        style={{
                            width: 'calc(var(--screen-width)/70)',
                            height: 'calc(var(--screen-width)/70)',
                            cursor: 'pointer',
                        }}
                        onClick={() => setClickedShare((v) => !v)}
                        aria-pressed={clickedShare}
                        aria-label="Share"
                    >
                        {clickedShare ? (
                            <SolidArrowUpOnSquareIcon
                                style={{
                                    width: 'calc(var(--screen-width)/70)',
                                    color: '#22c55e',
                                }}
                            />
                        ) : (
                            <ArrowUpOnSquareIcon
                                style={{
                                    width: 'calc(var(--screen-width)/70)',
                                }}
                            />
                        )}
                    </button>
                    <button
                        type="button"
                        style={{
                            width: 'calc(var(--screen-width)/70)',
                            height: 'calc(var(--screen-width)/70)',
                            cursor: 'pointer',
                        }}
                        onClick={() => setClickedHeart((v) => !v)}
                        aria-pressed={clickedHeart}
                        aria-label="Like"
                    >
                        {clickedHeart ? (
                            <SolidHeartIcon
                                style={{
                                    width: 'calc(var(--screen-width)/70)',
                                    color: '#ef4444',
                                }}
                            />
                        ) : (
                            <HeartIcon
                                style={{
                                    width: 'calc(var(--screen-width)/70)',
                                }}
                            />
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
