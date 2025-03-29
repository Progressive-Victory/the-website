'use client'
import { motion } from 'motion/react'
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
    avatar,
    avatarRounded = true,
    username,
    nameColor,
    image,
    text,
    delay = 0, // Delay for staggering
}: {
    avatar: string
    avatarRounded?: boolean
    username: string
    nameColor?: string
    text: string
    image?: string
    delay?: number
}) {
    const [clickedHeart, setClickedHeart] = useState<boolean>(false)
    const [clickedBubble, setClickedBubble] = useState<boolean>(false)
    const [clickedShare, setClickedShare] = useState<boolean>(false)

    return (
        <div className="hover:rotate-1 hover:scale-[102%] transition-transform ease-in-out">
            <motion.div
                className="flex flex-col items-center drop-shadow-lg justify-start w-fit xl:w-[30vw] p-4 bg-white rounded-md shadow-xl my-2 max-w-xl"
                initial={{ x: 100, opacity: 0 }} // Start position: off-screen to the right
                animate={{ x: 0, opacity: 1 }} // End position: visible and on-screen
                transition={{
                    duration: 0.5,
                    delay,
                    ease: 'easeOut',
                }}
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
        </div>
    )
}
