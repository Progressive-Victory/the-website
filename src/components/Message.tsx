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
            className="bg-white drop-shadow-lg shadow-xl rounded-md my-2 p-4 h-fit w-fit xl:w-[30vw] max-w-xl"
            initial={{ opacity: 0, scale: 0, ...motionProps?.initial }} // Start position: off-screen to the right
            animate={{ opacity: 1, scale: 1, ...motionProps?.animate }} // End position: visible and on-screen
            transition={{ ease: "backInOut", ...motionProps?.transition }}
        >
            <div className="flex flex-row items-center justify-start gap-x-4 mr-auto">
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
            <p className="mt-2 text-left mr-auto">{text}</p>
            {image && (
                <div className="relative w-full h-[300px]">
                    <Image
                        src={image}
                        alt={username}
                        className="rounded-lg object-cover mt-4"
                        style={{ objectPosition: '0 20%' }}
                        fill={true}
                        sizes='100%'
                    />
                </div>
            )}
            <div className="flex flex-row items-center justify-end gap-x-4 mt-8 ml-auto">
                <div
                    className="w-6 h-6 group"
                    onClick={() => setClickedBubble(!clickedBubble)}
                >
                    {clickedBubble ? (
                        <SolidChatBubbleLeftRightIcon className="text-blue-500 grow" />
                    ) : (
                        <ChatBubbleLeftRightIcon className="text-black group-hover:scale-110 transition-all duration-100" />
                    )}
                </div>
                <div
                    className="w-6 h-6 group"
                    onClick={() => setClickedShare(!clickedShare)}
                >
                    {clickedShare ? (
                        <SolidArrowUpOnSquareIcon className="text-green-500 grow" />
                    ) : (
                        <ArrowUpOnSquareIcon className="text-black group-hover:scale-110 transition-all duration-100" />
                    )}
                </div>
                <div
                    className="w-6 h-6 group"
                    onClick={() => setClickedHeart(!clickedHeart)}
                >
                    {clickedHeart ? (
                        <SolidHeartIcon className="text-red-500 grow" />
                    ) : (
                        <HeartIcon className="text-black group-hover:scale-110 transition-all duration-100" />
                    )}
                </div>
            </div>
        </motion.div>
    )
}
