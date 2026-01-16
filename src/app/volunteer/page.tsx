import VolunteerPage from '@/app/volunteer/page.client'
import { auth } from '@/util/auth'
import { redirect } from 'next/navigation'

export default async function Page() {
    const session = await auth()

    if (!session) {
        redirect('/login?redirect=/volunteer')
    }

    return <VolunteerPage />
}
