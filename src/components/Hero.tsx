'use client'
import { motion } from 'framer-motion'
import { Message } from './Message'
import Link from 'next/link'

export function Hero() {
    return (
        <div
            className="relative h-fit bg-steel-blue w-full flex flex-col items-center justify-start py-20"
            style={{
                backgroundImage: "url('images/halftone.svg')",
                backgroundSize: 'cover',
            }}
        >
            {/* Animated Main Text */}
            <div
                className="absolute top-10 left-0 lg:-translate-x-1/2 w-full lg:w-1/2 h-full"
                style={{
                    backgroundImage: "url('/images/blend_test.png')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'right',
                    mixBlendMode: 'lighten',
                }}
            ></div>
            <motion.div
                className="text-center w-full lg:w-1/2 px-4"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
            >
                <h1 className="text-4xl font-bold text-white">
                    Welcome to{' '}
                    <span className="whitespace-nowrap text-prussian">
                        Progressive Victory
                    </span>{' '}
                    the Online Community for Political Action.
                </h1>
                <p className="text-lg text-white my-8">
                    Find like minded people, share ideas, and engage in
                    meaningful political action. Get involved today!
                </p>
                <Link
                    href="/volunteer"
                    className="text-xl bg-valencia px-4 py-2 rounded-full text-white font-bold hover:bg-white hover:text-black transition duration-300 ease-in-out"
                >
                    Get Involved
                </Link>
            </motion.div>

            {/* Message Blocks */}
            <div className="mt-20 flex flex-wrap justify-center gap-6 px-2">
                <motion.div
                    initial={{ rotate: -4, y: 50, opacity: 0 }}
                    animate={{ rotate: -5, y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                >
                    <Message
                        avatar="https://picsum.photos/200"
                        username="John Doe"
                        nameColor="red"
                        text="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
                    />
                </motion.div>
                <motion.div
                    initial={{ rotate: 7, y: 50, opacity: 0 }}
                    animate={{ rotate: 1, y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.4 }}
                >
                    <Message
                        avatar="https://picsum.photos/201"
                        username="Jane Smith"
                        nameColor="blue"
                        image="/images/protestors-ukraine.jpg"
                        text="Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
                    />
                </motion.div>
                <motion.div
                    initial={{ rotate: -15, y: 50, opacity: 0 }}
                    animate={{ rotate: 6, y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.6 }}
                >
                    <Message
                        avatar="https://picsum.photos/202"
                        username="Alice Johnson"
                        nameColor="green"
                        text="Ut enim ad minim veniam, quis nostrud exercitation ullamco."
                    />
                </motion.div>
            </div>
        </div>
    )
}
