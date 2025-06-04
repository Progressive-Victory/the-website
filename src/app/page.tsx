import { Hero, MapGraphic, MemberBanner, Volunteer } from '@/app/home'
import { MainLayout } from '@/components/layout'
// HomePage
export default function Home() {
    return (
        <MainLayout>
            <div className="flex flex-col items-center overflow-x-hidden">
                <Hero />
                <Volunteer />
                <MapGraphic />
                <MemberBanner />
            </div>
        </MainLayout>
    )
}
