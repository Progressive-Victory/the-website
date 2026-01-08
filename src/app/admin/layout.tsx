import styles from './admin.module.css'
import ProtectedPage from '@/components/ProtectedPage'
import AdminNav from '@/components/admin/AdminNav'
import { Header } from '@/components/layout/Header'
import { get_collection_stats } from '@/util/stats'

export default async function Layout({
    children,
}: {
    children: React.ReactNode
}) {
    const stats = await get_collection_stats()

    return (
        <ProtectedPage requiredRoles={['Superadmin']}>
            <div className={styles.root}>
                <Header />

                <div className={styles.main}>
                    <AdminNav stats={stats} />

                    <div className={styles.content}>{children}</div>
                </div>
            </div>
        </ProtectedPage>
    )
}
