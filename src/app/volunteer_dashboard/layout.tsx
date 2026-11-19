import { LayoutContent } from './layout_content'
import { ProtectedPage } from '@/components/ProtectedPage'
import { PermissionIds } from '@/models'
import { Suspense } from 'react'
import type { ReactNode } from 'react'

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <Suspense fallback={null}>
            <ProtectedPage
                requiredPermissions={[PermissionIds.VOLUNTEER_DASHBOARD_ACCESS]}
            >
                <LayoutContent>{children}</LayoutContent>
            </ProtectedPage>
        </Suspense>
    )
}
