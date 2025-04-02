import { Metadata } from 'next'
import { MainLayout } from '@/components/MainLayout'
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
// Map calendar src embed to their RGB color
const calendarMap = new Map<string, string>([
    [
        '27d041938d95e549e529dcfa46f1989c1fde36c9acd31d07829872ef08e4961d@group.calendar.google.com',
        'ba7525',
    ],
    [
        'c_c92baa7ee2cd5e3a35a54b8a558a7bfec3cb0067c2eeaf63db81331340801b8e@group.calendar.google.com',
        '009949',
    ],
    [
        'Y185NDhjMzI5OWU3OTQ2N2M3MjBkNWQzMTY0YjEzOGU4OGRiM2FjNTFiNmUxMmM0ZTc2ZjAzZjY0NThjMTA2OGYzQGdyb3VwLmNhbGVuZGFyLmdvb2dsZS5jb20',
        'b09e00',
    ],
    [
        '0151b1ae27c001d91226349720dd486eb6c37a8c649807ad68d0aae28817d7c1@group.calendar.google.com',
        '0099e1',
    ],
])
export default function Events() {
    const calendarUri = new URL('https://calendar.google.com/calendar/embed')
    // build calendar string out of the base embed string plus their colors
    for (const [key, value] of calendarMap) {
        // src - calendar id, color - color that the events from that calendar show up as
        // the %23 magic value is # encoded into the URL
        calendarUri.searchParams.append('src', key)
        calendarUri.searchParams.append('color', '#' + value)
    }
    // Misc embed options
    calendarUri.searchParams.append('title', 'Progressive Victory')
    calendarUri.searchParams.append('mode', 'week')
    calendarUri.searchParams.append('wkst', '2')
    return (
        <MainLayout>
            <ClientCalendar src={calendarUri.toString()} />
        </MainLayout>
    )
}

// Add functionality for filtering calendar events based on type or tag - Needs API access as far as I can tell
// This will also be used to filter by user roles for logged in users - Needs API access as well
// E.g.. State  or Skill Team specific meeting.
// Add separate section to events page for upcoming major events - TODO
//Wishlist:
// Style google calendar widgets more in line with PV theme
