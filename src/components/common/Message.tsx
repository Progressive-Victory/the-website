'use client'
import { motion, TargetAndTransition, Transition } from 'motion/react'
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
import { useState } from 'react'
export function Message({
    motionProps,
    avatar,
    avatarRounded = true,
    username,
    nameColor,
    image,
    text,
}: {
    motionProps?: {
        initial?: TargetAndTransition
        animate?: TargetAndTransition
        transition?: Transition
    }
    avatar: string
    avatarRounded?: boolean
    username: string
    nameColor?: string
    text: string
    image?: string
}) {
    const [clickedHeart, setClickedHeart] = useState<boolean>(false)
    const [clickedBubble, setClickedBubble] = useState<boolean>(false)
    const [clickedShare, setClickedShare] = useState<boolean>(false)

    return (
        <motion.div
            className="my-2 h-fit w-fit max-w-xl rounded-md bg-white p-4 shadow-xl xl:w-[30vw]"
            style={{
                willChange: 'opacity, transform',
                transform: 'translateZ(0)',
            }}
            initial={{ opacity: 0, scale: 0, ...motionProps?.initial }} // Start position: off-screen to the right
            animate={{ opacity: 1, scale: 1, ...motionProps?.animate }} // End position: visible and on-screen
            transition={{ ease: 'backInOut', ...motionProps?.transition }}
        >
            <div className="mr-auto flex flex-row items-center justify-start gap-x-4">
                <Image
                    src={avatar}
                    alt={username}
                    className={`${avatarRounded ? 'rounded-full' : ''}`}
                    width={38}
                    height={38}
                />
                <p className="font-bold" style={{ color: nameColor }}>
                    {username}
                </p>
            </div>
            <p className="mr-auto mt-2 text-left">{text}</p>
            {image && (
                <div className="relative h-[300px] w-full">
                    <Image
                        src={image}
                        alt={username}
                        className="mt-4 rounded-lg object-cover"
                        style={{ objectPosition: '0 20%' }}
                        fill={true}
                        sizes="100%"
                    />
                </div>
            )}
            <div className="ml-auto mt-8 flex select-none flex-row items-center justify-end gap-x-4">
                <div
                    className="group h-6 w-6"
                    onClick={() => setClickedBubble(!clickedBubble)}
                >
                    {clickedBubble ? (
                        <SolidChatBubbleLeftRightIcon className="grow text-blue-500" />
                    ) : (
                        <ChatBubbleLeftRightIcon className="text-black transition-all duration-100 group-hover:scale-110" />
                    )}
                </div>
                <div
                    className="group h-6 w-6"
                    onClick={() => setClickedShare(!clickedShare)}
                >
                    {clickedShare ? (
                        <SolidArrowUpOnSquareIcon className="grow text-green-500" />
                    ) : (
                        <ArrowUpOnSquareIcon className="text-black transition-all duration-100 group-hover:scale-110" />
                    )}
                </div>
                <div
                    className="group h-6 w-6"
                    onClick={() => setClickedHeart(!clickedHeart)}
                >
                    {clickedHeart ? (
                        <SolidHeartIcon className="grow text-red-500" />
                    ) : (
                        <HeartIcon className="text-black transition-all duration-100 group-hover:scale-110" />
                    )}
                </div>
            </div>
        </motion.div>
    )
}
