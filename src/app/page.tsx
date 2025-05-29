import { Footer, Header } from '@/components/layout'
import { Hero, MapGraphic, Volunteer } from '@/components/HomePage'

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
