'use client'

import { TiltMessage } from '../../components/common/twitter_card_element/TiltLogic'
import {
    Message,
    MessageData,
} from '../../components/common/twitter_card_element/cards'
import styles from './hero.module.css'
import { Link } from '@/components/common'
import { HalftoneBackground } from '@/components/halftone/HalftoneBackground'
import { motion } from 'motion/react'
import type React from 'react'

const avatarImage = '/images/PV_Pride_Logo.png'

export function Hero() {
    const messages: MessageData[] = [
        {
            username: 'Progressive Victory',
            motionProps: {
                initial: { rotate: 20, y: 50 },
                animate: { rotate: -5, y: 0 },
                transition: { delay: 0.15, duration: 0.65 },
            },
            nameColor: 'red',
            text: "It's all fun and games w PV members at the Katie Wilson Watch Party tonight in Seattle! Congratulations to @wilsonformayor and all the volunteers who spent months working to help her win!",
            image: '/images/PVKatieWilsonWatchParty.jpeg',
            avatar: avatarImage,
            avatarRounded: false,
            imageProps: {
                position: 'center center',
                zoom: 1.4,
                offsetX: -8.5,
                offsetY: 0,
            },
            tiltProps: {
                strength: 1,
            },
        },
        {
            username: 'Progressive Victory',
            motionProps: {
                initial: { rotate: 15, y: 50 },
                animate: { rotate: 1, y: 0 },
                transition: { delay: 0.65, duration: 0.65 },
            },
            nameColor: 'red',
            text: 'Built by the internet, for America. Progressive Victory is a new kind of political institution: seamlessly marrying the electoral impact and volunteer power of traditional progressive organizations with the culture and community of digital third places.',
            avatar: avatarImage,
            avatarRounded: false,
            imageProps: {
                position: 'center center',
                zoom: 1,
                offsetX: 0,
                offsetY: 0,
            },
            tiltProps: {
                className: styles.messageMid,
                strength: 0.85,
            },
        },
        {
            username: 'Sam Dryzmala',
            motionProps: {
                initial: { rotate: 30, y: 50 },
                animate: { rotate: 6, y: 0 },
                transition: { delay: 0.3, duration: 0.9 },
            },
            nameColor: 'purple',
            text: 'I founded Progressive Victory with the dream of creating a political action community that comes together to get progressive policies & candidates the attention they deserve!',
            image: '/images/sam.jpg',
            avatar: '/images/sam_twitter_photo.jpeg',
            avatarRounded: true,
            imageProps: {
                position: 'center center',
                zoom: 1.2,
                offsetX: -5,
                offsetY: 10,
            },
            tiltProps: {
                strength: 1.1,
            },
        },
    ]

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
            <div className={styles.grid}>
                {messages.map((m, i) => (
                    <TiltMessage
                        key={m.username + i}
                        className={m.tiltProps?.className}
                        disabled={m.tiltProps?.disabled}
                        strength={m.tiltProps?.strength}
                        rotateMax={m.tiltProps?.rotateMax}
                        zRotate={m.tiltProps?.zRotate}
                        hoverScale={m.tiltProps?.hoverScale}
                    >
                        <Message
                            username={m.username}
                            text={m.text}
                            nameColor={m.nameColor}
                            image={m.image}
                            avatar={m.avatar}
                            avatarRounded={m.avatarRounded}
                            motionProps={m.motionProps}
                            imageProps={m.imageProps}
                        />
                    </TiltMessage>
                ))}
            </div>
        </div>
    )
}
