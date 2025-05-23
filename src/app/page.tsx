import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { Hero } from '@/components/HomePage/Hero'
import { MapGraphic } from '@/components/HomePage/MapGraphic'
import { Volunteer } from '@/components/HomePage/Volunteer'
export default function Home() {
    return (
        <div className="w-full">
            <Header />
            <div className="flex flex-col items-center overflow-x-hidden">
                <Hero />
                <Volunteer />
                <MapGraphic />
                <Footer />
            </div>
        </div>
    )
}
