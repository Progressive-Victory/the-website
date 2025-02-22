'use client'
import { motion } from 'motion/react'
import Image from 'next/image'
import {
    HeartIcon,
    ChatBubbleLeftRightIcon,
    ArrowUpOnSquareIcon,
} from '@heroicons/react/24/outline'

export function Message({
    avatar,
    username,
    nameColor,
    image,
    text,
    delay = 0, // Delay for staggering
}: {
    avatar: string
    username: string
    nameColor?: string
    text: string
    image?: string
    delay?: number
}) {
    return (
        <motion.div
            className="flex flex-col items-center justify-start w-fit xl:w-[30vw] p-4 bg-white rounded-md shadow-xl my-2"
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
                    className="w-12 h-12 rounded-full"
                    width={24}
                    height={24}
                />
                <p className="font-bold" style={{ color: nameColor }}>
                    {username}
                </p>
            </div>
            <p className="mt-2 text-left mr-auto max-w-md">{text}</p>
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
                <ChatBubbleLeftRightIcon className="w-6 h-6" />
                <ArrowUpOnSquareIcon className="w-6 h-6" />
                <HeartIcon className="w-6 h-6" />
            </div>
        </motion.div>
    )
}
