'use client'
import { useState } from 'react'
import { motion, useTransform, useSpring } from 'motion/react'
import { Link, Message } from '@/components/common'
// Quick avatar changer
const avatarImage = '/images/PV_Pride_Logo.png'

export function Hero() {
    return (
        <div className="relative flex w-full flex-col items-center justify-start py-20">
            {/* Background */}
            <div className="halftone z-1 absolute left-0 top-0 size-full opacity-10" />
            <div
                className="z-1 absolute left-0 top-0 size-full lg:w-1/2 lg:-translate-x-1/2"
                style={{
                    backgroundImage: "url('/images/blend_test.png')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'right',
                    mixBlendMode: 'lighten',
                }}
            />

            {/* Content */}
            <div className="z-2 relative left-0 top-0 flex flex-col items-center px-4 text-center md:w-2/3">
                <motion.div
                    style={{
                        willChange: 'opacity, transform',
                        transform: 'translateZ(0)',
                    }}
                    initial={{ y: 100, opacity: 0, scale: 0 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    transition={{ ease: 'backInOut', duration: 1, delay: 0.45 }}
                >
                    <h1 className="text-4xl font-bold text-white">
                        Welcome to{' '}
                        <span className="text-black-pearl-dark">
                            Progressive Victory
                        </span>{' '}
                        the Online Community for Political Action.
                    </h1>
                </motion.div>

                <motion.div
                    style={{
                        willChange: 'opacity, transform',
                        transform: 'translateZ(0)',
                    }}
                    initial={{ y: 50, opacity: 0, scale: 0 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    transition={{ ease: 'backInOut', duration: 1, delay: 0.25 }}
                >
                    <p className="my-8 text-xl font-[500] text-white">
                        Find like minded people, share ideas, and engage in
                        meaningful political action. Get involved today!
                    </p>
                </motion.div>

                <motion.div
                    style={{
                        willChange: 'opacity, transform',
                        transform: 'translateZ(0)',
                    }}
                    initial={{ y: 50, opacity: 0, scale: 0 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    transition={{
                        ease: 'backInOut',
                        duration: 0.8,
                        delay: 0.15,
                    }}
                >
                    <Link href="/volunteer" className="bg-valencia">
                        Get Involved
                    </Link>
                </motion.div>
            </div>

            {/* Message Blocks with Tilt Effect */}
            <div className="mt-20 flex flex-wrap justify-center gap-6 px-4">
                <div className="order-last xl:order-first">
                    <TiltMessage>
                        <Message
                            className="max-w-xl xl:w-[30vw]"
                            motionProps={{
                                initial: { rotate: 20, y: 50 },
                                animate: { rotate: -5, y: 0 },
                                transition: { delay: 0.15, duration: 0.65 },
                            }}
                            avatar={avatarImage}
                            avatarRounded={false}
                            username="Progressive Victory"
                            nameColor="red"
                            text="Progressive Victory is proud to support @benwikler for @DNC chair! 💙
            				We need more bold Democrats with track records of proven results leading the charge 💪"
                            image="/images/ben.jpg"
                        />
                    </TiltMessage>
                </div>

                <div className="h-fit lg:mt-24">
                    <TiltMessage>
                        <Message
                            className="max-w-xl xl:w-[30vw]"
                            motionProps={{
                                initial: { rotate: 15, y: 50 },
                                animate: { rotate: 1, y: 0 },
                                transition: { delay: 0.65, duration: 0.65 },
                            }}
                            avatar={avatarImage}
                            avatarRounded={false}
                            username="Progressive Victory"
                            nameColor="red"
                            text="Built by the internet, for the internet! — Progressive Victory is a new kind of political community turning the tides of elections across the country."
                        />
                    </TiltMessage>
                </div>
                <div className="order-first xl:order-last">
                    <TiltMessage>
                        <Message
                            className="max-w-xl xl:w-[30vw]"
                            motionProps={{
                                initial: { rotate: 30, y: 50 },
                                animate: { rotate: 6, y: 0 },
                                transition: { delay: 0.3, duration: 0.9 },
                            }}
                            avatar="/images/sam_twitter_photo.jpeg"
                            image="/images/sam.jpg"
                            username="Sam Dryzmala"
                            nameColor="purple"
                            text="I founded Progressive Victory with the dream of creating a political action community that comes together to get progressive policies & candidates the attention they deserve!"
                        />
                    </TiltMessage>
                </div>
            </div>
        </div>
    )
}

function useMousePosition() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

    const handleMouseMove = (e: React.MouseEvent) => {
        setMousePosition({ x: e.clientX, y: e.clientY })
    }

    return { mousePosition, handleMouseMove }
}

function TiltMessage({
    children,
    className,
}: {
    children: React.ReactNode
    className?: string
}) {
    const [isHovered, setIsHovered] = useState(false)
    const [canTilt, setCanTilt] = useState(false)
    const [touched, setTouched] = useState(false)
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
        if (!touched) {
            setIsHovered(true)
            const rect = e.currentTarget.getBoundingClientRect()
            setElementPosition({
                left: rect.left,
                top: rect.top,
                width: rect.width,
                height: rect.height,
            })
        }
    }

    const stopHoverAnimations = () => {
        setIsHovered(false)
        setCanTilt(false)
        tiltX.set(0)
        tiltY.set(0)
    }

    const handleTouchStart = () => {
        setTouched(true)
        stopHoverAnimations()
    }

    const handleTouchEnd = () => {
        setTouched(false)
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
                rotateZ: isHovered ? -2.5 : 0,
                scale: isHovered ? 1.02 : 1,
                padding: isHovered ? '2% 2% 2% 2%' : 0,
                margin: isHovered ? '-2% -2% -2% -2%' : 0,
            }}
            transition={{ duration: 0.2 }}
            onAnimationComplete={() => {
                if (isHovered) setCanTilt(true) // tilt after rotation
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={stopHoverAnimations}
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {children}
        </motion.div>
    )
    
}

