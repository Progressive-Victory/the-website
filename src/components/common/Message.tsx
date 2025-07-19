'use client'
import { JSX, useState } from 'react'
import {
    motion,
    TargetAndTransition,
    Transition,
    useSpring,
    useTransform,
} from 'motion/react'
import Image from 'next/image'
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
    const [clickedHeart, setClickedHeart] = useState<boolean>(false)
    const [clickedBubble, setClickedBubble] = useState<boolean>(false)
    const [clickedShare, setClickedShare] = useState<boolean>(false)

    return (
        <motion.div
            className={`my-2 flex size-fit max-w-[800px] flex-col gap-4 rounded-md bg-white p-4 shadow-xl ${className ?? className}`}
            style={{
                willChange: 'opacity, transform',
                transform: 'translateZ(0)',
            }}
            initial={{ opacity: 0, scale: 0, ...motionProps?.initial }} // Start position: off-screen to the right
            animate={{ opacity: 1, scale: 1, ...motionProps?.animate }} // End position: visible and on-screen
            transition={{ ease: 'backInOut', ...motionProps?.transition }}
        >
            {/* Header */}
            <div className="flex flex-col gap-2">
                <div className="mr-auto flex w-full flex-row items-center justify-between">
                    <div className="flex items-center gap-x-4">
                        <Image
                            src={avatar}
                            alt={username}
                            className={`${avatarRounded ? 'rounded-full' : ''}`}
                            width={38}
                            height={38}
                            unoptimized
                        />
                        <p className="font-bold" style={{ color: nameColor }}>
                            {username}
                        </p>
                    </div>

                    {/* <div className="flex items-center gap-x-4">
                        {topRightContent && topRightContent}
                        <EllipsisHorizontalIcon className="size-7 cursor-pointer" />
                    </div> */}
                </div>

                <p className="mr-auto text-left">{text}</p>
            </div>

            {/* Middle - Image */}
            {image && (
                <div className="relative h-[300px] w-full">
                    <Image
                        src={image}
                        alt={username}
                        className="rounded-lg object-cover"
                        style={{ objectPosition: '0 20%' }}
                        fill={true}
                        sizes="100%"
                    />
                </div>
            )}

            {/* Middle - Children */}
            {children && children}

            {/* Bottom Row */}
            {botDivider && <hr className="h-px w-full border-gray-200" />}

            <div className="flex flex-row items-center justify-between">
                <div className="flex gap-x-4">
                    {botLeftContent && botLeftContent}
                </div>

                <div className="flex gap-x-4">
                    <div
                        className="group size-6"
                        onClick={() => setClickedBubble(!clickedBubble)}
                    >
                        {clickedBubble ? (
                            <SolidChatBubbleLeftRightIcon className="grow text-blue-500" />
                        ) : (
                            <ChatBubbleLeftRightIcon className="text-black transition-all duration-100 group-hover:scale-110" />
                        )}
                    </div>
                    <div
                        className="group size-6"
                        onClick={() => setClickedShare(!clickedShare)}
                    >
                        {clickedShare ? (
                            <SolidArrowUpOnSquareIcon className="grow text-green-500" />
                        ) : (
                            <ArrowUpOnSquareIcon className="text-black transition-all duration-100 group-hover:scale-110" />
                        )}
                    </div>
                    <div
                        className="group size-6"
                        onClick={() => setClickedHeart(!clickedHeart)}
                    >
                        {clickedHeart ? (
                            <SolidHeartIcon className="grow text-red-500" />
                        ) : (
                            <HeartIcon className="text-black transition-all duration-100 group-hover:scale-110" />
                        )}
                    </div>
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
