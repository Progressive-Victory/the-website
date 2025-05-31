'use client'
import { useState, useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import Image from 'next/image'

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
    const { inView, observe } = useInView()
    const divRef = useRef<HTMLDivElement>(null)
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        if (divRef.current) observe(divRef.current)
    }, [observe])

    useEffect(() => {
        if (inView) setVisible(true)
    }, [inView])

    return (
        <div className="flex w-full flex-col items-center justify-center gap-y-24 bg-black-pearl-light py-20">
        <div className="flex w-full flex-col items-center justify-center gap-y-24 bg-black-pearl-light py-20">
            <h1 className="text-4xl font-bold text-white">
                What Can <span className="text-valencia">You </span> Do?
            </h1>
            <div className="flex flex-col items-center justify-center gap-10 px-10 xl:flex-row">
                {visible &&
                    actions.map((action, index) => (
                        <Card
                            key={action.title}
                            image={action.image}
                            title={action.title}
                            delay={index * 0.2}
                            description={action.description}
                        />
                    ))}
            </div>
            <div ref={divRef} />
        </div>
    )
}

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
                ease: 'backInOut',
            }}
            className="relative flex h-fit w-full flex-col items-center justify-start rounded-lg bg-white p-4 md:h-[275px] md:flex-row"
        >
            <Image src={image} alt={title} width={128} height={128} />
            <div className="flex flex-col items-center justify-center gap-x-4">
                <h1 className="text-center text-lg font-bold text-black-pearl-dark md:text-xl">
                    {title}
                </h1>
                <p className="md:text-md px-4 text-center text-sm text-black">
                    {description}
                </p>
            </div>
        </motion.div>
    )
}

const useInView = () => {
    const [inView, setInView] = useState(false)
    const observerRef = useRef<IntersectionObserver | null>(null)

    useEffect(() => {
        observerRef.current = new IntersectionObserver(([entry]) => {
            setInView(entry.isIntersecting)
        })

        return () => observerRef.current?.disconnect()
    }, [])

    const observe = (element: HTMLElement | null) => {
        if (element) observerRef.current?.observe(element)
    }

    return { inView, observe }
}
