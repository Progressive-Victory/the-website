'use client'
import { motion, useTransform, useSpring } from 'motion/react'
import { Message } from './Message'
import Link from 'next/link'
import { useState } from 'react'

//comment
function useMousePosition() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  
  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY })
  }

  return { mousePosition, handleMouseMove }
}

function TiltMessage({ children, className }: { children: React.ReactNode, className?: string }) {
    const [isHovered, setIsHovered] = useState(false)
    const [canTilt, setCanTilt] = useState(false)
    const [elementPosition, setElementPosition] = useState({ left: 0, top: 0, width: 0, height: 0 })
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
        height: rect.height
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
      const x = (mousePosition.x - elementPosition.left) / elementPosition.width
      const y = (mousePosition.y - elementPosition.top) / elementPosition.height
      
      tiltX.set((x - 0.5) * -.5)
      tiltY.set((y - 0.5) * -.5)
    }
  
    return (
      <motion.div
        className={className}
        style={{
          rotateX,
          rotateY,
          transformPerspective: 1000
        }}
        animate={{
          rotateZ: isHovered ? -2.5 : 0,
          scale: isHovered ? 1.02 : 1,
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

export function Hero() {
  return (
    <div className="relative h-full w-full flex flex-col items-center bg-steel-blue justify-start py-20">
      
      {/* Halftone background */}
      <div className="absolute top-0 left-0 w-full h-full halftone opacity-10 z-1" />
      {/* Animated Main Text */}
      <div
        className="absolute top-0 left-0 lg:-translate-x-1/2 w-full lg:w-1/2 h-full z-1"
        style={{
          backgroundImage: "url('/images/blend_test.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'right',
          mixBlendMode: 'lighten',
        }}
      />
      
      <div className="relative top-0 left-0 text-center w-full md:w-2/3 px-4 z-2 flex flex-col items-center">
        <motion.div
          style={{ willChange: "opacity, transform", transform: "translateZ(0)" }}
          initial={{ y: 100, opacity: 0, scale: 0 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ ease: "backInOut", duration: 1, delay: 0.45 }}
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
          style={{ willChange: "opacity, transform", transform: "translateZ(0)" }}
          initial={{ y: 50, opacity: 0, scale: 0 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ ease: "backInOut", duration: 1, delay: 0.25 }}
        >
          <p className="text-xl text-white my-8 font-[500]">
            Find like minded people, share ideas, and engage in
            meaningful political action. Get involved today!
          </p>
        </motion.div>

        <motion.div
          style={{ willChange: "opacity, transform", transform: "translateZ(0)" }}
          initial={{ y: 50, opacity: 0, scale: 0 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ ease: "backInOut", duration: .8, delay: 0.15 }}
        >
          <Link
            href="/volunteer"
            className="text-xl bg-valencia px-4 py-2 rounded-full text-white font-bold hover:bg-white hover:text-black-pearl-dark transition duration-300 ease-in-out"
          >
            Get Involved
          </Link>
        </motion.div>
      </div>

      {/* Message Blocks with Tilt Effect */}
      <div className="mt-20 flex flex-wrap justify-center gap-6 px-4">
        <TiltMessage className="order-last xl:order-first">
          <Message
            motionProps={{
              initial: { rotate: 20, y: 50 },
              animate: { rotate: -5, y: 0 },
              transition: { delay: 0.15, duration: 0.65 }
            }}
            avatar="/images/Logo_DB_Transparent.svg"
            avatarRounded={false}
            username="Progressive Victory"
            nameColor="red"
            text="Progressive Victory is proud to support @benwikler for @DNC chair! 💙
            We need more bold Democrats with track records of proven results leading the charge 💪"
            image="/images/ben.jpg"
          />
        </TiltMessage>

        <TiltMessage className="lg:mt-24 h-fit">
          <Message
            motionProps={{
              initial: { rotate: 15, y: 50 },
              animate: { rotate: 1, y: 0 },
              transition: { delay: .65, duration: 0.65 }
            }}
            avatar="/images/Logo_DB_Transparent.svg"
            avatarRounded={false}
            username="Progressive Victory"
            nameColor="red"
            text="Built by the internet, for the internet! — Progressive Victory is a new kind of political community turning the tides of elections across the country."
          />
        </TiltMessage>

        <TiltMessage className="order-first xl:order-last">
          <Message
            motionProps={{
              initial: { rotate: 30, y: 50 },
              animate: { rotate: 6, y: 0 },
              transition: { delay: 0.3, duration: 0.9 }
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
  )
}

