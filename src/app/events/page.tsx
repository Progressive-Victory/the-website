import { ClientCalendar } from './Calendar'
import { MainLayout } from '@/components/layout/MainLayout'
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
// Map calendar src embed to their RGB color
const calendarMap = new Map<string, string>([
    [
        'Nzc0NDI1MWUxMjQwZTQxNWUzNWE0NDAzMDE0OGZjM2VmODQwMmI4MmMzNDI4OTliNWFhNDUwM2M1M2ExNTJiYkBncm91cC5jYWxlbmRhci5nb29nbGUuY29t',
        'ba7525',
    ], // State Team Meetings was #b09e00
    [
        'MDE1MWIxYWUyN2MwMDFkOTEyMjYzNDk3MjBkZDQ4NmViNmMzN2E4YzY0OTgwN2FkNjhkMGFhZTI4ODE3ZDdjMUBncm91cC5jYWxlbmRhci5nb29nbGUuY29t',
        '0099e1',
    ], // Dept Team Meetings was #009949
    [
        'Y2Q3OWY0OGFkZTM1NDIzZTBhMjMyY2ZjZjE0NmU2MTlkMDZhZTgxNDNjMDRmYWU5MzI3ODc4OGJjZGMxOWIxZEBncm91cC5jYWxlbmRhci5nb29nbGUuY29t',
        '9802b3',
    ], // Special Events was #ba7525
    [
        'NjA4ZDRiYzU4NDA3YjhlMjcwNzQ1ZWUyMjI2YTI4OGU2NDZkNDMwMDExY2E3MTYyMjk1NGFjYmI2N2I5YTJjNUBncm91cC5jYWxlbmRhci5nb29nbGUuY29t',
        'fc035e',
    ], // Staff Meetings was #0099e1
    [
        'MjdkMDQxOTM4ZDk1ZTU0OWU1MjlkY2ZhNDZmMTk4OWMxZmRlMzZjOWFjZDMxZDA3ODI5ODcyZWYwOGU0OTYxZEBncm91cC5jYWxlbmRhci5nb29nbGUuY29t',
        'b09e00',
    ], // State Meetings was #9802b3
    [
        'Y185NDhjMzI5OWU3OTQ2N2M3MjBkNWQzMTY0YjEzOGU4OGRiM2FjNTFiNmUxMmM0ZTc2ZjAzZjY0NThjMTA2OGYzQGdyb3VwLmNhbGVuZGFyLmdvb2dsZS5jb20',
        '009949',
    ], // Volunteeer Initiatives was #fc035e
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
