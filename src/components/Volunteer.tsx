'use client'
import Image from 'next/image'
import { motion } from 'motion/react'
function Card({
    image,
    title,
    description,
    delay = 0,
}: {
    image: string
    title: string
    description: string
    delay?: number
}) {
    return (
        <motion.div
            initial={{ x: 100, opacity: 0 }} // Start position: off-screen to the right
            animate={{ x: 0, opacity: 1 }} // End position: visible and on-screen
            transition={{
                duration: 1.0,
                delay,
                ease: 'easeOut',
            }}
            className="relative flex flex-row items-center justify-start w-full bg-white rounded-lg p-4 h-fit md:h-[275px]"
        >
            <Image src={image} alt={title} width={128} height={128} />
            <div className="flex flex-col items-center justify-center gap-x-4">
                <h1 className="text-lg md:text-xl font-bold text-black text-center">
                    {title}
                </h1>
                <p className="text-sm md:text-md text-black text-center px-4">
                    {description}
                </p>
            </div>
        </motion.div>
    )
}

const actions = [
    {
        image: '/images/Halftone-Handshake.webp',
        title: 'Relational Organizing',
        description:
            'Even if we already vote in every election, we all know people who don’t. Making sure our friends and family understand the importance of engaged citizenship is our first responsibility, and we’ve got resources to help make those conversations easy.',
    },
    {
        image: '/images/Halftone-Phone.webp',
        title: 'Canvassing & Phonebanking',
        description:
            'To voters in key races. We’re reaching out to identify supporters, offer voting resources, and mobilize supporters. Action is the key to creating Progressive Victories!',
    },
    {
        image: '/images/Halftone-Clipboard.webp',
        title: 'Learn Political Action',
        description:
            'What goes into creating a progressive victory and how to achieve them yourself! We’re teaching volunteers the skills needed to effectively organize and achieve a political project goal.',
    },
]

export function Volunteer() {
    return (
        <div className="flex flex-col items-center justify-center bg-black-pearl-light py-20 w-full gap-y-24">
            <h1 className="text-4xl font-bold text-white">
                What Can <span className="text-valencia">You </span> Do?
            </h1>
            <div className="w-full flex flex-col xl:flex-row items-center justify-center gap-x-10 gap-y-10 px-4">
                {actions.map((action, index) => (
                    <Card
                        key={action.title}
                        image={action.image}
                        title={action.title}
                        delay={index * 0.5}
                        description={action.description}
                    />
                ))}
            </div>
        </div>
    )
}
