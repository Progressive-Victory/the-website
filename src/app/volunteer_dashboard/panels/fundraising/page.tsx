import { PageContent } from './PageContent'
import { ProtectedPage } from '@/components/ProtectedPage'
import { PermissionIds } from '@/models'

export default function Page() {
    return (
        <ProtectedPage
            requiredPermissions={[PermissionIds.VIEW_FUNDRAISING_PANEL]}
        >
            <PageContent />
        </ProtectedPage>
    )
}
