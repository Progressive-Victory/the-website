import { Hero, MapGraphic, MemberBanner, Volunteer, VolunteerMap } from '@/app/home'
import { MainLayout } from '@/components/layout'
// HomePage
export default function Home() {
  return (
    <MainLayout>
      <div className="flex flex-col items-center overflow-x-hidden">
        <Hero />
        <VolunteerMap />
        <Volunteer />
        <MapGraphic />
        <MemberBanner />
      </div>
    </MainLayout>
  )
}
