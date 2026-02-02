'use client'

import styles from './hero.module.css'
import { Message } from '@/components/common'
import { BaseButton } from '@/components/common/buttons/Button'
import buttonStyles from '@/components/common/buttons/Button.module.css'
import { MessageData } from '@/components/common/twitter_card_element/Card'
import { HalftoneBackground } from '@/components/halftone/HalftoneBackground'
import { motion } from 'motion/react'
import type React from 'react'

const avatarImage = '/images/PV_Pride_Logo.png'

export function Hero() {
    const messages: MessageData[] = [
        {
            username: 'Progressive Victory',
            nameColor: 'red',
            text: "It's all fun and games w PV members at the Katie Wilson Watch Party tonight in Seattle! Congratulations to @wilsonformayor and all the volunteers who spent months working to help her win!",
            image: '/images/PVKatieWilsonWatchParty.jpeg',
            avatar: avatarImage,
            avatarRounded: false,
            motionProps: {
                initial: { rotate: 20, y: 50 },
                animate: { rotate: -5, y: 0 },
                transition: { delay: 0.15, duration: 0.65 },
            },
            imageProps: {
                position: 'center center',
                zoom: 1.4,
                offsetX: -8.5,
                offsetY: 0,
            },
            tiltProps: {
                className: styles.orderLastXlFirst,
                strength: { amount: 1 },
            },
        },
        {
            username: 'Progressive Victory',
            nameColor: 'red',
            text: 'Built by the internet, for America. Progressive Victory is a new kind of political institution: seamlessly marrying the electoral impact and volunteer power of traditional progressive organizations with the culture and community of digital third places.',
            avatar: avatarImage,
            avatarRounded: false,
            motionProps: {
                initial: { rotate: 15, y: 50 },
                animate: { rotate: 1, y: 0 },
                transition: { delay: 0.65, duration: 0.65 },
            },
            tiltProps: {
                className: styles.messageMid,
                strength: { amount: 0.85 },
            },
        },
        {
            username: 'Sam Dryzmala',
            nameColor: 'purple',
            text: 'I founded Progressive Victory with the dream of creating a political action community that comes together to get progressive policies & candidates the attention they deserve!',
            image: '/images/sam.jpg',
            avatar: '/images/sam_twitter_photo.jpeg',
            avatarRounded: true,
            motionProps: {
                initial: { rotate: 30, y: 50 },
                animate: { rotate: 6, y: 0 },
                transition: { delay: 0.3, duration: 0.9 },
            },
            imageProps: {
                position: 'center center',
                zoom: 1.2,
                offsetX: -5,
                offsetY: 10,
            },
            tiltProps: {
                className: styles.orderFirstXlLast,
                strength: { amount: 1.1 },
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
                    <p className={styles.subtitle}>
                        Find like minded people, share ideas, and engage in
                        meaningful political action. Get involved today!
                    </p>
                </motion.div>

                <motion.div
                    style={{
                        willChange: 'opacity, transform',
                        transform: 'translateZ(0)',
                        display: 'flex',
                        gap: '1rem',
                    }}
                    initial={{ y: 50, opacity: 0, scale: 0 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    transition={{
                        ease: 'backInOut',
                        duration: 0.8,
                        delay: 0.15,
                    }}
                >
                    <BaseButton
                        label="Learn More"
                        href="/about"
                        className={buttonStyles.minimalProminent}
                    />
                    <BaseButton
                        label="Join"
                        href="/volunteer"
                        className={styles.joinButton}
                    />
                </motion.div>
            </div>

            <div className={styles.messages}>
                {messages.map((m, i) => (
                    <Message
                        key={i}
                        className={styles.messageCard}
                        username={m.username}
                        text={m.text}
                        nameColor={m.nameColor}
                        image={m.image}
                        imageProps={m.imageProps}
                        avatar={m.avatar}
                        avatarRounded={m.avatarRounded}
                        motionProps={m.motionProps}
                        tiltProps={m.tiltProps}
                    />
                ))}
            </div>
        </div>
    )
}
