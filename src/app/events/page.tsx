import { MainLayout } from '@/components/MainLayout'
import { Frame } from '@/components/Frame'
import { Metadata } from 'next'
export const metadata: Metadata = {
    title: 'PV - Events',
    description: 'See what we are up to!',
    openGraph: {
        title: 'PV - Events',
        description: 'See what we are up to!',
        url: `https://${process.env.SITE_URL}/`,
        siteName: 'Progressive Victory',
        images: [{ url: `https://${process.env.SITE_URL}/images/banner.png` }],
    },
}
const eventsCalendarSrc: string = "&src=c_c92baa7ee2cd5e3a35a54b8a558a7bfec3cb0067c2eeaf63db81331340801b8e%40group.calendar.google.com&color=%23009949";
const otherEventsSrc: string = "&src=Y185NDhjMzI5OWU3OTQ2N2M3MjBkNWQzMTY0YjEzOGU4OGRiM2FjNTFiNmUxMmM0ZTc2ZjAzZjY0NThjMTA2OGYzQGdyb3VwLmNhbGVuZGFyLmdvb2dsZS5jb20&color=%230099e1"
// Embed options
const standardParams = "&mode=week&showPrint=0&showTz=0&height=100&showNav=0&showTabs=0"
export default function Events() {
    // Get timezone and encode it to use in the URL
    const timezoneParameter: string = "&ctz=" + encodeURI(Intl.DateTimeFormat().resolvedOptions().timeZone);
    const calendarEmbedURL: string = "https://calendar.google.com/calendar/embed?title=Progressive%20Victory%20" + otherEventsSrc + eventsCalendarSrc + standardParams + timezoneParameter;

    return (
        <MainLayout>
            <div className="bg-steel-blue w-full h-full flex flex-col items-center p-4 gap-y-10">
                <div className="w-full bg-[#f0f4f9] rounded-lg py-4 mx-6">
                    <p className="text-center text-3xl font-black lg:text-5xl">
                        Progressive Victory Calendar
                    </p>
                    <Frame
                        src={calendarEmbedURL}
                        className="mx-auto h-[1000px] mt-4 w-[95%] bg-[#f0f4f9]"
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

// Add functionality for filtering calendar events based on type or tag - Needs API access as far as I can tell
// This will also be used to filter by user roles for logged in users - Needs API access as well
// E.g.. State  or Skill Team specific meeting.
// Add separate section to events page for upcoming major events - TODO
//Wishlist:
   // Style google calendar widgets more in line with PV theme