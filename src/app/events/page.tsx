import { Metadata } from 'next'
import { ClientCalendar } from '@/components/Calendar'
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
const baseString = "https://calendar.google.com/calendar/embed?title=Progressive%20Victory%20"
const eventsCalendarSrc: string = "&src=c_c92baa7ee2cd5e3a35a54b8a558a7bfec3cb0067c2eeaf63db81331340801b8e%40group.calendar.google.com&color=%23009949";
const otherEventsSrc: string = "&src=Y185NDhjMzI5OWU3OTQ2N2M3MjBkNWQzMTY0YjEzOGU4OGRiM2FjNTFiNmUxMmM0ZTc2ZjAzZjY0NThjMTA2OGYzQGdyb3VwLmNhbGVuZGFyLmdvb2dsZS5jb20&color=%23b09e00";
const organzingMeetingsSrc: string = "&src=27d041938d95e549e529dcfa46f1989c1fde36c9acd31d07829872ef08e4961d%40group.calendar.google.com&color=%23ba7525";
const skillTeamMeetingsSrc: string = "&src=0151b1ae27c001d91226349720dd486eb6c37a8c649807ad68d0aae28817d7c1%40group.calendar.google.com&color=%230099e1";
// Embed options
const standardParams = "&mode=week&wkst=2"

export default function Events() {
    return <ClientCalendar>{baseString + eventsCalendarSrc + otherEventsSrc + organzingMeetingsSrc + skillTeamMeetingsSrc + standardParams}</ClientCalendar>
}

// Add functionality for filtering calendar events based on type or tag - Needs API access as far as I can tell
// This will also be used to filter by user roles for logged in users - Needs API access as well
// E.g.. State  or Skill Team specific meeting.
// Add separate section to events page for upcoming major events - TODO
//Wishlist:
   // Style google calendar widgets more in line with PV theme