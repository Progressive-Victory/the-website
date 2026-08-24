'use client'

import styles from './admin.module.css'
import { ProtectedPage } from '@/components/ProtectedPage'
import { NavigationStack } from '@/components/common/navigation_stack/NavigationStack'
import { Detail } from '@/components/common/navigation_stack/detail/Detail'
import { Header } from '@/components/layout/Header'

export default function Layout() {
    return (
        <ProtectedPage requiredRoles={['Superadmin']}>
            <div className={styles.root}>
                <Header />
                <NavigationStack
                    className={styles.navigationStack}
                    sidebar={<div>Place Holder Sidebar content</div>}
                    detail={
                        <Detail
                            bodyType="panel"
                            label={'placeholder'}
                            body={<div>Place Holder Detail content</div>}
                        />
                    }
                    unselected={<div>Place Holder Unselected content</div>}
                />
            </div>
        </ProtectedPage>
    )
}
