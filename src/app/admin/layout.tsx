import ProtectedPage from '@/components/ProtectedPage'
import AdminNav from '@/components/admin/AdminNav'
import { MainLayout } from '@/components/layout'

export default function ({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedPage requiredRoles={['Superadmin']}>
            <MainLayout>
                <div className="relative flex size-full flex-col bg-steel-blue">
                    <div className="halftone z-2 absolute left-0 top-0 size-full py-20 opacity-10" />

                    <div className="z-1 grid flex-1 grid-cols-12 items-stretch gap-x-4 overflow-hidden opacity-90">
                        <AdminNav />
                        {children}
                    </div>
                </div>
            </MainLayout>
        </ProtectedPage>
    )
}
