import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { Hero } from '@/components/Hero'
import { MapGraphic } from '@/components/MapGraphic'
import { Volunteer } from '@/components/Volunteer'
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
