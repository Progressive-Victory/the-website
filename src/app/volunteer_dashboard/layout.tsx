'use client'

import styles from './admin.module.css'
import { ProtectedPage } from '@/components/ProtectedPage'
import { Header } from '@/components/layout/Header'

export default function Layout(/*({ children }: { children: React.ReactNode }) */) {
    return (
        <ProtectedPage requiredRoles={['Superadmin']}>
            <div className={styles.root}>
                <Header />
                Placeholder for later in PR
            </div>
        </ProtectedPage>
    )
}
