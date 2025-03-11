import { MainLayout } from '@/components/MainLayout'
import { Frame } from '@/components/Frame'
import { Metadata } from 'next'
export const metadata: Metadata = {
    title: 'PV - Events',
    description: 'See what we are up to!',
    openGraph: {
        title: 'PV - Events',
        description: 'See what we are up to!',
        url: `https://${process.env.VERCEL_URL}/`,
        siteName: 'Progressive Victory',
        images: [
            { url: `https://${process.env.VERCEL_URL}/images/banner.png` },
        ],
    },
}
export default function Events() {
    return (
        <MainLayout>
            <div className="bg-steel-blue w-full h-full flex flex-col items-center p-10 gap-y-10">
                <div className="w-full bg-[#f0f4f9] rounded-lg my-4 py-4 mx-6">
                    <p className="text-center text-3xl font-black lg:text-5xl">
                        Upcoming Events Calendar
                    </p>
                    <Frame
                        src="https://calendar.google.com/calendar/embed?src=c_c92baa7ee2cd5e3a35a54b8a558a7bfec3cb0067c2eeaf63db81331340801b8e%40group.calendar.google.com&ctz=America%2FDetroit"
                        className="mx-auto h-[600px] mt-4 w-[95%] bg-[#f0f4f9]"
                        type="calendar"
                        title="Calendar"
                    >
                        Loading…
                    </Frame>
                </div>
                <div className="w-full bg-[#f0f4f9] rounded-lg my-4 py-4 mx-6">
                    <p className="text-center text-3xl font-black lg:text-5xl">
                        Primary Calendar
                    </p>
                    <Frame
                        src="https://calendar.google.com/calendar/embed?height=600&wkst=2&bgcolor=%23ffffff&ctz=America%2FChicago&title=Progressive%20Victory%20&src=Y185NDhjMzI5OWU3OTQ2N2M3MjBkNWQzMTY0YjEzOGU4OGRiM2FjNTFiNmUxMmM0ZTc2ZjAzZjY0NThjMTA2OGYzQGdyb3VwLmNhbGVuZGFyLmdvb2dsZS5jb20&color=%23F6BF26"
                        className="mx-auto h-[600px] mt-4 w-[95%] bg-[#f0f4f9]"
                        type="calendar"
                        title="Calendar"
                    >
                        Loading…
                    </Frame>
                </div>
            </div>
        </MainLayout>
    )
}
