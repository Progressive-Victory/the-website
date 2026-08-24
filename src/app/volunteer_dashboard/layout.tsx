'use client'

import styles from './admin.module.css'
import { ProtectedPage } from '@/components/ProtectedPage'
import { NavigationStack } from '@/components/common/navigation_stack/NavigationStack'
import { Header } from '@/components/layout/Header'

export default function Layout(/*({ children }: { children: React.ReactNode }) */) {
    // const isPanelSelected = pathname.startsWith('/volunteer_dashboard/panels/')

    return (
        <ProtectedPage requiredRoles={['Superadmin']}>
            <div className={styles.root}>
                <Header />
                <NavigationStack
                    className={styles.navigationStack}
                    // isSelected={isPanelSelected}
                    sidebar={<div>Place Holder Sidebar content</div>}
                    detail={<div>Place Holder Detail content</div>}
                    unSelected={<div>Place Holder Unselected content</div>}
                />
            </div>
        </ProtectedPage>
    )
}
