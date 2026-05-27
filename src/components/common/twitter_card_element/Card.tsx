'use client'

import styles from './Card.module.css'
import { BaseButton } from '@/components/common/buttons/Button'
import {
    HeartIcon,
    ChatBubbleLeftRightIcon,
    ArrowUpOnSquareIcon,
    EllipsisHorizontalIcon,
} from '@heroicons/react/24/outline'
import {
    HeartIcon as SolidHeartIcon,
    ChatBubbleLeftRightIcon as SolidChatBubbleLeftRightIcon,
    ArrowUpOnSquareIcon as SolidArrowUpOnSquareIcon,
} from '@heroicons/react/24/solid'
import {
    motion,
    useSpring,
    useTransform,
    type TargetAndTransition,
    type Transition,
} from 'motion/react'
import Image from 'next/image'
import type React from 'react'
import { useState } from 'react'

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

    strength?: {
        amount?: number
    }

    rotation?: {
        max?: number
        z?: number
    }

    scale?: {
        hover?: number
    }
}

interface MessageProps {
    avatar: string
    username: string
    children: React.ReactNode

    motionProps?: MotionProps
    tiltProps?: TiltProps
    avatarRounded?: boolean
    className?: string
    nameColor?: string
    image?: string
    imageProps?: ImageProps

    childrenBelowText?: React.JSX.Element
    botLeftContent?: React.JSX.Element
    botDivider?: boolean
    showEllipsis?: boolean

    ctaLabel?: string
    ctaHref?: string
    ctaClassName?: string
    ctaTarget?: React.HTMLAttributeAnchorTarget
    ctaRel?: string
}

export function Message({
    avatar,
    username,
    children,

    motionProps,
    tiltProps,
    avatarRounded = true,
    className,
    nameColor,
    image,
    imageProps,

    botLeftContent,
    botDivider = false,
    showEllipsis = false,

    ctaLabel,
    ctaHref,
    ctaClassName,
    ctaTarget,
    ctaRel,
}: MessageProps): React.JSX.Element {
    const [clickedHeart, setClickedHeart] = useState(false)
    const [clickedBubble, setClickedBubble] = useState(false)
    const [clickedShare, setClickedShare] = useState(false)

    const cardClassName = [styles.message, className].filter(Boolean).join(' ')

    const imgPosition = imageProps?.position ?? 'center'
    const imgZoom = imageProps?.zoom ?? 1
    const imgOffsetX = imageProps?.offsetX ?? 0
    const imgOffsetY = imageProps?.offsetY ?? 0

    const tiltDefaults: Required<
        Pick<TiltProps, 'disabled' | 'strength' | 'rotation' | 'scale'>
    > = {
        disabled: false,
        strength: { amount: 1 },
        rotation: { max: 10, z: -2.5 },
        scale: { hover: 1.02 },
    }

    const mergedTilt: TiltProps = {
        className: tiltProps?.className,
        disabled: tiltProps?.disabled ?? tiltDefaults.disabled,

        strength: {
            ...tiltDefaults.strength,
            ...(tiltProps?.strength ?? {}),
        },

        rotation: {
            ...tiltDefaults.rotation,
            ...(tiltProps?.rotation ?? {}),
        },

        scale: {
            ...tiltDefaults.scale,
            ...(tiltProps?.scale ?? {}),
        },
    }

    const card = (
        <motion.div
            className={cardClassName}
            style={{
                willChange: 'opacity, transform',
                transform: 'translateZ(0)',
            }}
            initial={{ opacity: 0, scale: 0, ...motionProps?.initial }}
            animate={{ opacity: 1, scale: 1, ...motionProps?.animate }}
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

                    {showEllipsis && (
                        <div className={styles.ellipsisLayout}>
                            {ctaHref && ctaLabel ? (
                                <BaseButton
                                    label={ctaLabel}
                                    href={ctaHref}
                                    target={ctaTarget}
                                    rel={ctaRel}
                                    className={[styles.primary, ctaClassName]
                                        .filter(Boolean)
                                        .join(' ')}
                                />
                            ) : null}

                            <button
                                type="button"
                                className={styles.ellipsisButton}
                                aria-label="More options"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <EllipsisHorizontalIcon
                                    className={styles.ellipsisIcon}
                                />
                            </button>
                        </div>
                    )}
                </div>

                <div className={styles.text}>{children}</div>
            </div>

            {image && (
                <div className={styles.mediaWrap}>
                    <Image
                        src={image}
                        alt={username}
                        className={styles.media}
                        fill
                        sizes="100%"
                        style={{
                            objectPosition: imgPosition,
                            transform: `translate(${imgOffsetX}%, ${imgOffsetY}%) scale(${imgZoom})`,
                            transformOrigin: imgPosition,
                        }}
                    />
                </div>
            )}

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
                                className={`${styles.iconSolid} ${styles.bubbleActive} ${styles.iconGrowPop}`}
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
                                className={`${styles.iconSolid} ${styles.shareActive} ${styles.iconGrowPop}`}
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
                                className={`${styles.iconSolid} ${styles.heartActive} ${styles.iconGrowPop}`}
                            />
                        ) : (
                            <HeartIcon className={styles.icon} />
                        )}
                    </button>
                </div>
            </div>
        </motion.div>
    )

    return <TiltWrapper tiltProps={mergedTilt}>{card}</TiltWrapper>
}

function useMousePosition() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

    const handleMouseMove = (e: React.MouseEvent) => {
        setMousePosition({ x: e.clientX, y: e.clientY })
    }

    return { mousePosition, handleMouseMove }
}

function TiltWrapper({
    children,
    tiltProps,
}: {
    children: React.ReactNode
    tiltProps: TiltProps
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

    const disabled = tiltProps.disabled ?? false
    const strength = tiltProps.strength?.amount ?? 1
    const rotateMax = tiltProps.rotation?.max ?? 10
    const zRotate = tiltProps.rotation?.z ?? -2.5
    const hoverScale = tiltProps.scale?.hover ?? 1.02

    const tiltX = useSpring(0, { stiffness: 300, damping: 50 })
    const tiltY = useSpring(0, { stiffness: 300, damping: 50 })

    const rotateX = useTransform(tiltY, [-1, 1], [-rotateMax, rotateMax])
    const rotateY = useTransform(tiltX, [-1, 1], [-rotateMax, rotateMax])

    const handleMouseEnter = (e: React.MouseEvent) => {
        if (disabled) return
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
        if (disabled) return
        setIsHovered(false)
        setCanTilt(false)
        tiltX.set(0)
        tiltY.set(0)
    }

    if (!disabled && isHovered && canTilt) {
        const x =
            (mousePosition.x - elementPosition.left) / elementPosition.width
        const y =
            (mousePosition.y - elementPosition.top) / elementPosition.height

        tiltX.set((x - 0.5) * 0.5 * strength)
        tiltY.set((y - 0.5) * -0.5 * strength)
    }

    return (
        <div>
            <div
                className={styles.innerBox}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <motion.div
                    className={[styles.tilt, tiltProps.className]
                        .filter(Boolean)
                        .join(' ')}
                    style={{
                        rotateX: disabled ? 0 : rotateX,
                        rotateY: disabled ? 0 : rotateY,
                        transformPerspective: 1000,
                    }}
                    animate={{
                        rotateZ: disabled ? 0 : isHovered ? zRotate : 0,
                        scale: disabled ? 1 : isHovered ? hoverScale : 1,
                    }}
                    transition={{ duration: 0.2 }}
                    onAnimationComplete={() => {
                        if (!disabled && isHovered) setCanTilt(true)
                    }}
                    onMouseMove={disabled ? undefined : handleMouseMove}
                >
                    {children}
                </motion.div>
            </div>
        </div>
    )
}
