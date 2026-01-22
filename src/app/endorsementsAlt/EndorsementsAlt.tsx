'use client'

// import {
//     ENDORSEMENTS,
//     type Endorsement,
// } from '../endorsements/endorsements.data'
// import styles from '@/app/endorsements/endorsement.module.css'
import styles from '@/app/home/hero.module.css'
import { Message } from '@/components/common'
import { BaseButton } from '@/components/common/buttons/Button'
import buttonStyles from '@/components/common/buttons/Button.module.css'
import { MessageData } from '@/components/common/twitter_card_element/Card'
import { HalftoneBackground } from '@/components/halftone/HalftoneBackground'
import { motion } from 'motion/react'
// import { motion, useTransform, useSpring } from 'motion/react'
// import Image from 'next/image'
import type React from 'react'

const avatarImage = '/images/PV_Pride_Logo.png'

export function EndorsementAlt() {
    const messages: MessageData[] = [
        {
            username: 'Progressive Victory',
            nameColor: 'red',
            text: "It's all fun and games w PV members at the Katie Wilson Watch Party tonight in Seattle! Congratulations to @wilsonformayor and all the volunteers who spent months working to help her win!",
            image: '/images/ANALILIA MEJIA.png',
            avatar: avatarImage,
            avatarRounded: false,
            motionProps: {
                initial: { rotate: 20, y: 50 },
                animate: { rotate: 0, y: 0 },
                transition: { delay: 0.15, duration: 0.65 },
            },
            imageProps: {
                position: 'center center',
                zoom: 0.81,
                offsetX: 0,
                offsetY: 0,
            },
            tiltProps: {
                className: styles.orderLastXlFirst,
                disabled: false,
                strength: { amount: 0 },
                rotation: { max: 0, z: 0 },
                scale: { hover: 1.05 },
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
                        Meet The{' '}
                        <span className={styles.titleEmphasis}>
                            2026 Candidates
                        </span>{' '}
                        We Are Endorsing
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
                        Learn about each of the candidates we are supporting.
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
                        label="PV Pledge"
                        href="/about"
                        className={buttonStyles.minimalProminent}
                    />
                    <BaseButton
                        label="Get Involved"
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
