import { PageContent } from './PageContent'
import { ProtectedPage } from '@/components/ProtectedPage'
import { PermissionIds } from '@/models'

export default function Page() {
    return (
        <ProtectedPage
            requiredPermissions={[PermissionIds.VIEW_POSITIONS_PANEL]}
        >
            <PageContent />
        </ProtectedPage>
    )
}
