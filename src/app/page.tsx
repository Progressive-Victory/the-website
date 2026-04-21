import { Hero, MemberBanner, Volunteer, VolunteerMap } from '@/app/home'
import { MainLayout } from '@/components/layout/MainLayout'

// HomePage
export default function Home() {
    return (
        <MainLayout>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    overflowX: 'hidden',
                    width: '100%',
                }}
            >
                <Hero />
                <Volunteer />
                <VolunteerMap />
                <MemberBanner />
            </div>
        </MainLayout>
    )
}
