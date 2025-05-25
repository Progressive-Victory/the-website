import ProtectedPage from "@/components/ProtectedPage";
import { Metadata } from "next";
import AdminDash from "@/components/admin/AdminDash";

const SITE_URL = process.env.SITE_URL

if (!SITE_URL) throw Error('Please define the SITE_URL environment variable')

export const metadata: Metadata = {
    title: 'PV - Admin',
    description: 'Portal for Administration of the Website and Database',
    openGraph: {
        title: 'PV - Admin',
        description: 'Portal for Administration of the Website and Database',
        url: `https://${SITE_URL}/`,
        siteName: 'Progressive Victory',
        images: [{ url: `https://${SITE_URL}/images/banner.png` }],
    },
}

export default function AdminPage() {
    return (
        <ProtectedPage requiredRoles={["Superadmin"]}>
            <AdminDash />
        </ProtectedPage>
    )
}