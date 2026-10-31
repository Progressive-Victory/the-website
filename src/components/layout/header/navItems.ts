import { NavItem } from '../types'

export const navitems: NavItem[] = [
    {
        name: 'About',
        href: '/about',
        subnav: {
            columns: [
                {
                    title: 'Learn',
                    items: [
                        { name: 'Mission', href: '/about' },
                        { name: 'Community', href: '/about' },
                    ],
                },
            ],
        },
    },
    {
        name: 'Volunteer',
        href: '/volunteer',
        subnav: {
            columns: [
                {
                    title: 'Get involved',
                    items: [{ name: 'Join', href: '/volunteer' }],
                },
            ],
        },
    },
    {
        name: 'Events',
        href: '/events',
        subnav: {
            columns: [
                {
                    title: 'Browse',
                    items: [
                        { name: 'Calendar', href: '/events' },
                        {
                            name: 'Mobilize',
                            href: 'https://www.mobilize.us/progressivevictory/',
                        },
                    ],
                },
            ],
        },
    },
    {
        name: 'Endorsements',
        href: '/endorsements',
        subnav: {
            columns: [
                {
                    title: 'Endorsements',
                    items: [
                        { name: 'View Endorsements', href: '/endorsements' },
                    ],
                },
            ],
        },
    },
    {
        name: 'More',
        href: '/',
        subnav: {
            columns: [
                {
                    title: 'Join',
                    items: [
                        { name: 'Volunteer', href: '/volunteer' },
                        {
                            name: 'Contact',
                            href: 'https://docs.google.com/forms/d/e/1FAIpQLSdBRKV6bbxcx6HtNALWyjAwvEXbGSIG9s7iFEFlCEImVXILHA/viewform',
                        },
                    ],
                },
                {
                    title: 'Support PV',
                    items: [
                        {
                            name: 'Dues Paying Membership',
                            href: 'https://secure.actblue.com/donate/pvmember?refcode=Website%20Header',
                        },
                        {
                            name: 'Merch',
                            href: 'https://progressivevictory.myshopify.com/',
                        },
                    ],
                },
            ],
        },
    },
]
