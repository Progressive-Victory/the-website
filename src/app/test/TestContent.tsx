'use client'

import styles from '@/app/styles/pages/TestContent.module.css'
import { ContentPageFrame } from '@/components/ContentSections'
import { ModularButton } from '@/components/common/ButtonComponent'

export default function TestContent() {
    return (
        <ContentPageFrame>
            <section className={styles.container}>
                <p className={styles.title}>
                    Button{' '}
                    <span className={styles.titleHighlight}>Playground</span>
                </p>

                <div className={styles.subtitle}>
                    This page exists to test buttons.
                </div>

                <div className={styles.buttonRow}>
                    <ModularButton
                        label="Primary"
                        buttonType="custom"
                        buttonStyle="primary"
                        buttonFunction="alert"
                        alertMessage="You clicked a primary button!"
                    />

                    <ModularButton label="Home" buttonType="nav" href="/" />

                    <ModularButton label="Donate" buttonType="donate" />

                    <ModularButton
                        label="Drawer Donate"
                        buttonType="donate"
                        buttonVariant="long"
                    />
                </div>
            </section>
        </ContentPageFrame>
    )
}
