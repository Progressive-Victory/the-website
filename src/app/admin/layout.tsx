import ProtectedPage from '@/components/ProtectedPage'
import AdminNav from '@/components/admin/AdminNav'
import { Header } from '@/components/layout'

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedPage requiredRoles={['Superadmin']}>
            <div className="relative flex size-full min-h-screen flex-col">
                <Header />
                <div className="flex flex-1 bg-gray-50">
                    <AdminNav />
                    <div className="flex h-[calc(100vh-100px)] flex-1">
                        {children}
                    </div>
                </div>
            </div>
        </ProtectedPage>
    )
}
