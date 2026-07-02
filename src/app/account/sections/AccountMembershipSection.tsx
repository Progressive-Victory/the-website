'use client'

import InteractiveThreeCard, { safeLogError } from '../../home/MemberBanner'
import styles from '@/app/account/account.module.css'
import { MembershipBulletPoints } from '@/app/home/MembershipBulletPoints'
import { BaseButton } from '@/components/common/buttons/Button'
import { useInView } from '@/util/hooks'
import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

export function AccountMembershipSection() {
    // ideally this would conditionally render the
    // become-a-member splash if the user isn't one,
    // but we can't track that yet ):

    // motion dependencies
    const { inView, observe } = useInView()
    const containerRef = useRef<HTMLDivElement>(null)
    const [visible, setVisible] = useState<boolean>(false)

    useEffect(() => {
        try {
            if (containerRef.current) observe(containerRef.current)
        } catch (err) {
            safeLogError(err, 'observe error:')
        }
    }, [observe])

    useEffect(() => {
        try {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            if (inView) setVisible(true) // 07/02/26 - not currently worth addressing
        } catch (err) {
            safeLogError(err, 'inView effect error:')
        }
    }, [inView])

    return (
        <section className={styles.content}>
            <header className={styles.contentHeader}>
                <div className={styles.headerTopRow}>
                    <div className={styles.headerTextBlock}>
                        <p className={styles.pageTitle}>Become a Member</p>

                        <p className={styles.pageSubtitle}>
                            Get your own Progressive Victory membership card!
                        </p>
                    </div>

                    <div className={styles.headerActions}>
                        <BaseButton
                            href="https://secure.actblue.com/donate/pvmember"
                            label="Become a Member"
                            className={`${styles.secondaryButton} ${styles.buttonHover}`}
                        />
                    </div>
                </div>
            </header>

            <div className={styles.contentPanel}>
                <div
                    ref={containerRef}
                    className={`${styles.contentBackground} ${styles.contentRow}`}
                >
                    <motion.div
                        className={styles.cardColumn}
                        initial={{ opacity: 0, y: 50 }}
                        animate={visible ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                    >
                        <div className={styles.cardColumnInner}>
                            <InteractiveThreeCard
                                dynamic
                                backImage="/images/membercard_back.png"
                            />
                        </div>
                    </motion.div>

                    <MembershipBulletPoints visible={visible} />
                </div>
            </div>
        </section>
    )
}
