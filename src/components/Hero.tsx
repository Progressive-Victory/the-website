'use client'
import { motion } from 'motion/react'
import { Message } from './Message'
import Link from 'next/link'

export function Hero() {
    return (
        <div className="relative h-fit w-full flex flex-col items-center bg-steel-blue justify-start py-20">
            {/* Halftone background */}
            <div className="absolute top-0 left-0 w-full h-full halftone opacity-10 z-1" />
            {/* Animated Main Text */}
            <div
                className="absolute top-0 left-0 lg:-translate-x-1/2 w-full lg:w-1/2 h-full"
                style={{
                    backgroundImage: "url('/images/blend_test.png')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'right',
                    mixBlendMode: 'lighten',
                }}
            />
            <motion.div
                className="relative top-0 left-0 text-center w-full md:w-2/3 px-4 z-2 flex flex-col items-center"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
            >
                <h1 className="text-4xl font-bold text-white">
                    Welcome to{' '}
                    <span className="text-black-pearl-dark">
                        Progressive Victory
                    </span>{' '}
                    the Online Community for Political Action.
                </h1>
                <p className="text-xl text-white my-8">
                    Find like minded people, share ideas, and engage in
                    meaningful political action. Get involved today!
                </p>
                <Link
                    href="/volunteer"
                    className="text-xl bg-valencia px-4 py-2 rounded-full text-white font-bold hover:bg-white hover:text-black-pearl-dark transition duration-300 ease-in-out"
                >
                    Get Involved
                </Link>
            </motion.div>

            {/* Message Blocks */}
            <div className="mt-20 flex flex-wrap justify-center gap-6 px-4">
                <motion.div
                    initial={{ rotate: -4, y: 50, opacity: 0 }}
                    animate={{ rotate: -5, y: 0, opacity: 1 }}
                    transition={{
                        duration: 0.8,
                        ease: 'easeOut',
                        delay: 0.2,
                    }}
                    className="order-last xl:order-first"
                >
                    <Message
                        avatar="/images/Logo_DB_Transparent.svg"
                        avatarRounded={false}
                        username="Progressive Victory"
                        nameColor="red"
                        text="Progressive Victory is proud to support @benwikler for @DNC chair! 💙
                        We need more bold Democrats with track records of proven results leading the charge 💪"
                        image="/images/ben.jpg"
                    />
                </motion.div>
                <motion.div
                    initial={{ rotate: 7, y: 50, opacity: 0 }}
                    animate={{ rotate: 1, y: 0, opacity: 1 }}
                    className="lg:mt-24"
                    transition={{
                        duration: 0.8,
                        ease: 'easeOut',
                        delay: 0.4,
                    }}
                >
                    <Message
                        avatar="/images/Logo_DB_Transparent.svg"
                        avatarRounded={false}
                        username="Progressive Victory"
                        nameColor="red"
                        text="Built by the internet, for the internet! — Progressive Victory is a new kind of political community turning the tides of elections across the country."
                    />
                </motion.div>
                <motion.div
                    initial={{ rotate: -15, y: 50, opacity: 0 }}
                    animate={{ rotate: 6, y: 0, opacity: 1 }}
                    transition={{
                        duration: 0.8,
                        ease: 'easeOut',
                        delay: 0.6,
                    }}
                    className="order-first xl:order-last"
                >
                    <Message
                        avatar="/images/sam_twitter_photo.jpeg"
                        image="/images/sam.jpg"
                        username="Sam Dryzmala"
                        nameColor="purple"
                        text="I founded Progressive Victory with the dream of creating a political action community that comes together to get progressive policies & candidates the attention they deserve!"
                    />
                </motion.div>
            </div>
        </div>
    )
}
