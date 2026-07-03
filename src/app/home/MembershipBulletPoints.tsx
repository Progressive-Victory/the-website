'use client'

import styles from './membership.module.css'
import { motion } from 'motion/react'
import Image from 'next/image'

interface BulletPointItem {
    title: string
    sub: number
    description: string
    bullet: string
}
type BulletPointProps = BulletPointItem & { delay?: number }

function BulletPoint({
    title,
    description,
    sub,
    bullet,
    delay = 0,
}: BulletPointProps) {
    return (
        <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay, ease: 'backInOut' }}
            className={styles.bulletRow}
        >
            <Image
                className={styles.bulletIcon}
                src={`/images/${bullet}`}
                alt={bullet}
                width={48}
                height={48}
                unoptimized
            />
            <div className={styles.bulletText}>
                <h3 className={styles.bulletTitle}>{title}</h3>
                <h4 className={styles.bulletSub}>${sub}/month</h4>
                <p className={styles.bulletDescription}>{description}</p>
            </div>
        </motion.div>
    )
}

const bulletPoints: BulletPointItem[] = [
    {
        title: 'Dues Paying Member',
        sub: 5,
        bullet: 'PV_DPM_Logo.png',
        description:
            'Gain your very own PV membership card, recognition at the end of our long-form content, and your very own sticker!',
    },
    {
        title: 'Premium Member',
        sub: 10,
        bullet: 'PV_DPM_Logo.png',
        description:
            'Early Access to the Progressive Victory Monthly Newsletter and priority questions during Q&As with PV staff. ',
    },
    {
        title: 'Signature Member',
        sub: 20,
        bullet: 'PV_DPM_Signature_Logo.png',
        description:
            'Exclusive text chat in the PV Discord with the Strategic Advisors and a really sick PV Baseball cap!',
    },
    {
        title: 'Inner Circle Member',
        sub: 100,
        bullet: 'PV_DPM_Inner_Circle_Logo.png',
        description:
            'The Complete Progressive Victory Merch Bundle Including A Progressive Victory Signature Mug, A Progressive Victory Waves Water Bottle, A Progressive Victory Waves Tee navy blue shirt.',
    },
]

interface MembershipBulletPointsProps {
    visible: boolean
}

export function MembershipBulletPoints({
    visible,
}: MembershipBulletPointsProps) {
    return (
        <motion.div
            className={styles.bulletsColumn}
            initial="hidden"
            animate={visible ? 'visible' : 'hidden'}
        >
            <div className={styles.bulletsOverflow}>
                {visible &&
                    bulletPoints.map((point, index) => (
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
    )
}
