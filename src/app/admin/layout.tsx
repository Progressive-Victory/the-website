import ProtectedPage from '@/components/ProtectedPage'
import AdminNav from '@/components/admin/AdminNav'
import { Header } from '@/components/layout'
import { get_collection_stats } from '@/util/stats'

export default async function Layout({
    children,
}: {
    children: React.ReactNode
}) {
    const stats = await get_collection_stats()

    return (
        <ProtectedPage requiredRoles={['Superadmin']}>
            <div className="relative flex size-full min-h-screen flex-col">
                <Header />
                <div className="flex flex-1 bg-gray-50">
                    <AdminNav stats={stats} />
                    <div className="flex h-[calc(100dvh-100px)] flex-1">
                        {children}
                    </div>
                </div>
            </div>
        </ProtectedPage>
    )
}
