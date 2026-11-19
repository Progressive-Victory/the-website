import { PageContent } from '../fundraising/PageContent'
import { ProtectedPage } from '@/components/ProtectedPage'
import { PermissionIds } from '@/models'

export default function Page() {
    return (
        <ProtectedPage
            requiredPermissions={[PermissionIds.VIEW_ENDORSEMENT_PANEL]}
        >
            <PageContent />
        </ProtectedPage>
    )
}
