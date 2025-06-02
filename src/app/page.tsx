import { Hero, MapGraphic, Volunteer } from '@/app/home'
import { MainLayout } from '@/components/layout'
import { MemberBanner } from '@/components/MemberBanner'
// HomePage
export default function Home() {
    return (
        <MainLayout>
            <div className="flex flex-col items-center overflow-x-hidden">
                <Hero />
                <Volunteer />
                <MemberBanner/>
                <MapGraphic />
            </div>
        </MainLayout>
    )
}
