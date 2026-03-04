'use client'

import styles from './events.module.css'
import { Frame } from '@/app/events/Frame'
import { HalftoneBackground } from '@/components/halftone/HalftoneBackground'
import { useHydration } from '@/util/hooks'
import { Suspense } from 'react'

export function ClientCalendar({ src }: Readonly<{ src: string }>) {
    const hydrated = useHydration()

    // Get client timezone and encode it to use in the URL
    const timezoneParameter =
        '&ctz=' + encodeURI(Intl.DateTimeFormat().resolvedOptions().timeZone)

    return (
        <div className={styles.container}>
            <HalftoneBackground />

            <div className={styles.card}>
                <p className={styles.title}>Progressive Victory Calendar</p>

                <Suspense key={hydrated ? 'local' : 'utc'}>
                    <Frame
                        src={src + timezoneParameter}
                        className={styles.frame}
                        type="calendar"
                        title="Calendar"
                    >
                        Loading…
                    </Frame>
                </Suspense>
            </div>
        </div>
    )
}
