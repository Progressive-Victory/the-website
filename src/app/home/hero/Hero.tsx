'use client'

import styles from './hero.module.css'
import { HeroCards } from '@/app/home/hero/HeroCards'
import { Link } from '@/components/common'
import { HalftoneBackground } from '@/components/halftone/HalftoneBackground'
import { motion } from 'motion/react'
import type React from 'react'

export function Hero() {
    return (
        <div className={styles.hero}>
            <HalftoneBackground />

            <div
                className={styles.blendPanel}
                style={{
                    backgroundImage: "url('/images/blend_test.png')",
                }}
            />

            <div className={styles.content}>
                <motion.div
                    style={{
                        willChange: 'opacity, transform',
                        transform: 'translateZ(0)',
                    }}
                    initial={{ y: 100, opacity: 0, scale: 0 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    transition={{ ease: 'backInOut', duration: 1, delay: 0.45 }}
                >
                    <h1 className={styles.title}>
                        Welcome to{' '}
                        <span className={styles.titleEmphasis}>
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
                    <h2 className={styles.subtitle}>
                        Find like minded people, share ideas, and engage in
                        meaningful political action. Get involved today!
                    </h2>
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
                    <div className={styles.heroButtons}>
                        <Link href="/about" className={styles.learnMoreBtn}>
                            Learn More
                        </Link>

                        <Link href="/volunteer" className={styles.joinBtn}>
                            Join
                        </Link>
                    </div>
                </motion.div>
            </div>
            <HeroCards />
        </div>
    )
}
