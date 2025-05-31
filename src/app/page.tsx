import { Hero, MapGraphic, Volunteer } from '@/app/home'
import { MainLayout } from '@/components/layout/MainLayout'

export default function Home() {
    return (
        <MainLayout>
            <div className="flex flex-col items-center overflow-x-hidden">
                <Hero />
                <Volunteer />
                <MapGraphic />
            </div>
        </MainLayout>
    )
}
