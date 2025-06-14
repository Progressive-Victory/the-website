'use client'
import Image, { StaticImageData } from 'next/image'
import { motion, useSpring, useTransform } from 'motion/react'
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from '@/components/common';

interface CardProps {
  frontImage: string | StaticImageData
  backImage: string | StaticImageData
}

function InteractiveThreeCard({ frontImage, backImage }: CardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [elementPosition, setElementPosition] = useState({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  })

  const tiltX = useSpring(0, { stiffness: 500, damping: 300 })
  const tiltY = useSpring(0, { stiffness: 500, damping: 300 })

  const flipSpring = useSpring(0, { stiffness: 300, damping: 30 })

  const rotateX = useTransform(tiltY, [-1, 1], [-15, 15]);
  const rotateY = useTransform<number, number>(
    [tiltX, flipSpring],
    ([x, flip]) => (x * 15) + flip
  )

  const handleMouseEnter = (e: React.MouseEvent) => {
    setIsHovered(true)
    const rect = e.currentTarget.getBoundingClientRect()
    setElementPosition({
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
    })
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    tiltX.set(0)
    tiltY.set(0)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isHovered) return
    const x = e.clientX - elementPosition.left
    const y = e.clientY - elementPosition.top
    const centerX = elementPosition.width / 2
    const centerY = elementPosition.height / 2

    const normX = (x - centerX) / centerX
    const normY = (y - centerY) / centerY

    tiltX.set(normX)
    tiltY.set(normY * -1)
  }

  const handleClick = () => {
    const isCurrentlyFlipped = flipSpring.get() === 180
    flipSpring.set(isCurrentlyFlipped ? 0 : 180)
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <motion.div
        className="relative h-[300px] w-full max-w-[500px] cursor-pointer"
        style={{
          perspective: 1000,
          transformStyle: 'preserve-3d',
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        whileTap={{ scale: 0.95 }}
        animate={{ scale: isHovered ? 1.03 : 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <motion.div
          className="size-full"
          style={{
            rotateX,
            rotateY,
            transformStyle: 'preserve-3d',
          }}
        >
          <motion.div
            className="absolute inset-0 overflow-hidden rounded-xl bg-white shadow-2xl"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'translateZ(1px)',
            }}
          >
            <Image
              src={frontImage}
              alt="Front content"
              fill
              className="object-cover"
              priority
              sizes="500px"
              quality={100}
              unoptimized
            />
          </motion.div>

          <motion.div
            className="absolute inset-0 overflow-hidden rounded-xl bg-white shadow-2xl"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg) translateZ(1px)',
            }}
          >
            <Image
              src={backImage}
              alt="Back content"
              fill
              className="object-cover"
              priority
              sizes="500px"
              quality={100}
              unoptimized
            />
          </motion.div>

          <div className="absolute inset-0 rounded-xl">
            <div className="absolute inset-0 rounded-xl border-8 border-gray-200/50" />
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default InteractiveThreeCard

interface BulletPointItem {
  title: string;
  sub: number;
  description: string;
  bullet: string;
}
type BulletPointProps = BulletPointItem & { delay?: number }

function BulletPoint({ title, description, sub, bullet, delay = 0 }: BulletPointProps) {
  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay, ease: 'backInOut' }}
      className="flex w-full items-start gap-5 rounded-xl bg-white p-5 shadow-lg"
    >
      <Image
        className="mt-[3.5px]"
        src={`/images/${bullet}`}
        alt={bullet}
        width={48}
        height={48}
        unoptimized
      />
      <div>
        <h3 className="mb-0.5 text-lg font-semibold text-black-pearl-dark">{title}</h3>
        <h4 className="mb-3 font-semibold text-valencia">${sub}/month</h4>
        <p className="text-base text-gray-600">{description}</p>
      </div>
    </motion.div>
  )
}

const bulletPoints: BulletPointItem[] = [
  {
    title: 'Dues Paying Member',
    sub: 5,
    bullet: 'PV_DPM_Logo.png',
    description: 'Gain your very own PV membership card, recognition at the end of our long-form content, and your very own sticker!',
  },
  {
    title: 'Premium Member',
    sub: 10,
    bullet: 'PV_DPM_Logo.png',
    description: 'Early Access to the Progressive Victory Monthly Newsletter and priority questions during Q&As with PV staff. ',
  },
  {
    title: 'Signature Member',
    sub: 20,
    bullet: 'PV_DPM_Signature_Logo.png',
    description: 'Exclusive text chat in the PV Discord with the Strategic Advisors and a really sick PV Baseball cap!',
  },
  {
    title: 'Inner Circle Member',
    sub: 100,
    bullet: 'PV_DPM_Inner_Circle_Logo.png',
    description: 'The Complete Progressive Victory Merch Bundle Including A Progressive Victory Signature Mug, A Progressive Victory Waves Water Bottle, A Progressive Victory Waves Tee navy blue shirt.',
  },
]

interface UseInViewReturn {
  inView: boolean
  observe: (element: HTMLElement | null) => void
}

const useInView = (): UseInViewReturn => {
  const [inView, setInView] = useState<boolean>(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      observerRef.current = new IntersectionObserver(([entry]) => {
        setInView(!!entry?.isIntersecting);
      }, { threshold: 0.1 });
    }

    return () => observerRef.current?.disconnect();
  }, []);

  const observe = useCallback((element: HTMLElement | null) => {
    if (element && observerRef.current) {
      observerRef.current.observe(element);
    }
  }, []);

  return { inView, observe };
};

// safe logs <3
function safeLogError(err: unknown, prefix = '') {
  if (err instanceof Error) {
    console.error(prefix, err)
  } else {
    const safeMessage = typeof err === 'object' && err !== null
      ? JSON.stringify(err)
      : String(err)
    console.error(prefix, safeMessage)
  }
}


export function MemberBanner() {
  const { inView, observe } = useInView();
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    try {
      if (containerRef.current) observe(containerRef.current);
    } catch (err) {
      safeLogError(err, 'observe error:');
    }
  }, [observe]);

  useEffect(() => {
    try {
      if (inView) setVisible(true);
    } catch (err) {
      safeLogError(err, 'inView effect error:');
    }
  }, [inView]);

  return (
    <div className="relative w-full bg-black-pearl-light px-4 py-16 md:px-8 md:py-24">
      {/* Halftone background pattern */}
      <div className="halftone absolute left-0 top-0 size-full opacity-10" />
      
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-14">
        <motion.h1 
          className="text-center text-4xl/[2.75rem] font-bold text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={visible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          Get Your Own Progressive Victory <br />
          <span className="text-valencia">Membership Card</span>
        </motion.h1>
        
        <div
          ref={containerRef}
          className="flex flex-col gap-8 md:gap-12 min-[1020px]:flex-row-reverse"
        >
          <motion.div
            className="mx-auto flex w-full max-w-[500px] justify-center min-[1020px]:w-[55%] min-[1020px]:max-w-none"
            initial={{ opacity: 0, y: 50 }}
            animate={visible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
          >
            <div className="mb-8 w-full max-w-[500px] min-[1020px]:mt-14">
              <InteractiveThreeCard
                frontImage="/images/membercard_front.png"
                backImage="/images/membercard_back.png"
              />

              <motion.div 
                className="mt-10 flex justify-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={visible ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.6, type: 'spring' }}
              >
                <Link
                  href="https://secure.actblue.com/donate/pvmember"
                  className="hover:bg-valencia-dark bg-valencia transition-colors"
                >
                  Become a Member
                </Link>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            className="w-full pb-12 min-[1020px]:w-[45%] min-[1020px]:pb-0"
            initial="hidden"
            animate={visible ? "visible" : "hidden"}
          >
            <div className="flex flex-col gap-6 overflow-hidden">
              {visible && bulletPoints.map((point, index) => (
                <BulletPoint
                  key={point.title}
                  title={point.title}
                  description={point.description}
                  sub={point.sub}
                  bullet={point.bullet}
                  delay={index * 0.15 + 0.2}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}