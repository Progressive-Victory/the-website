/* A number of committees can be defined up to the number of icons. */
import { Banner } from '../components/banner'
import { CreateBlankNode } from '../components/blankNode'
import { CreateEdge } from '../components/edge'
import { CreateGroupNode } from '../components/group'
import { CreatePositionNode } from '../components/position'
import { Tag } from '../components/tag'
import { Edge, type Node } from '@xyflow/react'

export const Tags: Tag[] = [
    {
        name: 'Community Team',
        graphic: (
            <svg width="32" height="32">
                <circle
                    r="10"
                    cx="16"
                    cy="16"
                    fill="#1b4568"
                    stroke="#fcd34d"
                />
            </svg>
        ),
    },
    {
        name: 'Media Team',
        graphic: (
            <svg width="32" height="32">
                <polygon
                    points="16,4 28,24 4,24"
                    fill="#1b4568"
                    stroke="#fcd34d"
                />
            </svg>
        ),
    },
    {
        name: 'Engineering Committee',
        graphic: (
            <svg width="32" height="32">
                <rect
                    width="20"
                    height="20"
                    x="6"
                    y="6"
                    fill="#1b4568"
                    stroke="#fcd34d"
                />
            </svg>
        ),
    },
    {
        name: 'State Organizing Committee',
        graphic: (
            <svg width="32" height="32">
                <polygon
                    points="15,5 25,15 15,25 5,15"
                    fill="#1b4568"
                    stroke="#fcd34d"
                />
            </svg>
        ),
    },
]

export const orgchartData: Node[] = [
    CreatePositionNode({
        id: 0,
        title: 'Executive Director',
        name: 'Sam Dryzmala',
        banner: Banner.RED,
        bannerTitle: 'Senior Leadership',
    }),
    CreatePositionNode({
        id: 1,
        title: 'Deputy Executive Director',
        name: 'Benjamin Gilbert-Lif',
        banner: Banner.RED,
        bannerTitle: 'Senior Leadership',
    }),
    CreateGroupNode({
        id: 2,
        name: 'Community Department',
        leads: [
            {
                id: 3,
                title: 'Community Relations Director',
                name: 'Auntifa',
                banner: Banner.RED,
                bannerTitle: 'Senior Leadership',
            },
            {
                id: 4,
                title: 'Community Mananger',
                name: 'Jenywlfersn',
                banner: Banner.BLUE,
                bannerTitle: 'Junior Leadership',
                tags: [Tags[0], Tags[1]],
            },
            {
                id: 5,
                title: 'Community Manager',
                banner: Banner.BLUE,
                bannerTitle: 'Junior Leadership',
                tags: [Tags[0], Tags[1]],
            },
        ],
    }),
    CreateGroupNode({
        id: 6,
        name: 'Welcome Team',
        desc: 'Yada yada yada',
        leads: [
            {
                id: 7,
                title: 'Welcome Team Lead',
                name: 'Monarch',
                banner: Banner.BLUE,
                bannerTitle: 'Junior Leadership',
                tags: [Tags[0]],
            },
            {
                id: 8,
                title: 'Welcome Team Lead',
                banner: Banner.BLUE,
                bannerTitle: 'Junior Leadership',
                tags: [Tags[0]],
            },

            {
                id: 9,
                title: 'Welcome Team Deputy',
            },
        ],
    }),
    CreateGroupNode({
        id: 10,
        name: 'Events Team',
        desc: 'Yada yada yada',
        leads: [
            {
                id: 11,
                title: 'Events Team Lead',
                name: 'BrewMasterCraft',
                banner: Banner.BLUE,
                bannerTitle: 'Junior Leadership',
                tags: [Tags[0]],
            },
            {
                id: 12,
                title: 'Events Team Lead',
                banner: Banner.BLUE,
                bannerTitle: 'Junior Leadership',
                tags: [Tags[0]],
            },
            {
                id: 13,
                title: 'Events Team Deputy',
                name: 'Em',
            },
        ],
    }),
    CreateGroupNode({
        id: 14,
        name: 'Media Department',
        leads: [
            {
                id: 15,
                title: 'Media Director',
                name: 'Aussy',
                banner: Banner.RED,
                bannerTitle: 'Senior Leadership',
            },
            {
                id: 16,
                title: 'Deputy Media Director',
                name: 'LeeLoo',
                banner: Banner.RED,
                bannerTitle: 'Senior Leadership',
            },
            {
                id: 17,
                title: 'Deputy Media Director',
                banner: Banner.RED,
                bannerTitle: 'Senior Leadership',
            },
        ],
    }),
    CreateGroupNode({
        id: 18,
        name: 'Writing Team',
        desc: 'Yada yada yada',
        leads: [
            {
                id: 19,
                title: 'Writing Team Lead',
                name: 'Dynas',
                banner: Banner.BLUE,
                bannerTitle: 'Junior Leadership',
                tags: [Tags[0], Tags[1]],
            },
            {
                id: 20,
                title: 'Writing Team Lead',
                name: 'AJ',
                banner: Banner.BLUE,
                bannerTitle: 'Junior Leadership',
                tags: [Tags[0], Tags[1]],
            },
            {
                id: 21,
                title: 'Writing Team Deputy',
                name: 'Jam',
                tags: [Tags[0], Tags[1]],
            },
        ],
    }),
    CreateGroupNode({
        id: 22,
        name: 'Audio-Video Team',
        desc: 'Yada yada yada',
        leads: [
            {
                id: 23,
                title: 'Audio-Video Team Lead',
                name: 'Vezanmatics',
                banner: Banner.BLUE,
                bannerTitle: 'Junior Leadership',
                tags: [Tags[1]],
            },
            {
                id: 24,
                title: 'Audio-Video Team Lead',
                banner: Banner.BLUE,
                bannerTitle: 'Junior Leadership',
                tags: [Tags[1]],
            },
            {
                id: 25,
                title: 'Audio-Video Team Deputy',
            },
        ],
    }),
    CreateGroupNode({
        id: 26,
        name: 'Design Team',
        desc: 'Yada yada yada',
        leads: [
            {
                id: 27,
                title: 'Events Team Lead',
                name: 'Unfilled',
                banner: Banner.BLUE,
                bannerTitle: 'Junior Leadership',
                tags: [Tags[1]],
            },
            {
                id: 28,
                title: 'Events Team Lead',
                name: 'Unfilled',
                banner: Banner.BLUE,
                bannerTitle: 'Junior Leadership',
                tags: [Tags[1]],
            },
            {
                id: 29,
                title: 'Events Team Lead',
                name: 'Unfilled',
            },
        ],
    }),
    CreateGroupNode({
        id: 30,
        name: 'Operations Department',
        leads: [
            {
                id: 31,
                title: 'Operations Director',
                name: 'Jay',
                banner: Banner.RED,
                bannerTitle: 'Senior Leadership',
            },
            {
                id: 32,
                title: 'Operations Deputy',
                name: 'Unfilled',
                banner: Banner.RED,
                bannerTitle: 'Senior Leadership',
            },
            {
                id: 33,
                title: 'Operations Deputy',
                name: 'Unfilled',
                banner: Banner.RED,
                bannerTitle: 'Senior Leadership',
            },
        ],
    }),
    CreateGroupNode({
        id: 34,
        name: 'Fundraising Team',
        desc: 'Yada yada yada',
        leads: [
            {
                id: 35,
                title: 'Fundraising Team Lead',
                name: 'Brewmastercraft',
                banner: Banner.BLUE,
                bannerTitle: 'Junior Leadership',
            },
            {
                id: 36,
                title: 'Fundraising Team Lead',
                banner: Banner.BLUE,
                bannerTitle: 'Junior Leadership',
            },
            {
                id: 37,
                title: 'Fundraising Team Deputy',
            },
        ],
    }),
    CreateGroupNode({
        id: 38,
        name: 'Documentation Team',
        desc: 'Yada yada yada',
        leads: [
            {
                id: 39,
                title: 'Documentation Lead',
                banner: Banner.BLUE,
                bannerTitle: 'Junior Leadership',
            },
            {
                id: 40,
                title: 'Documentation Lead',
                banner: Banner.BLUE,
                bannerTitle: 'Junior Leadership',
            },
            {
                id: 41,
                title: 'Documentation Deputy',
            },
        ],
    }),
    CreateGroupNode({
        id: 42,
        name: 'Infrastructure Department',
        leads: [
            {
                id: 43,
                title: 'Infrastructure Director',
                name: 'Kianna',
                banner: Banner.RED,
                bannerTitle: 'Senior Leadership',
            },
            {
                id: 44,
                title: 'Deputy Infrastructure Director',
                banner: Banner.RED,
                bannerTitle: 'Senior Leadership',
            },
            {
                id: 45,
                title: 'Deputy Infrastructure Director',
                banner: Banner.RED,
                bannerTitle: 'Senior Leadership',
            },
        ],
    }),
    CreateGroupNode({
        id: 46,
        name: 'Research Team',
        desc: 'Yada yada yada',
        leads: [
            {
                id: 47,
                title: 'Research Team Lead',
                name: 'Phoenix',
                banner: Banner.BLUE,
                bannerTitle: 'Junior Leadership',
            },
            {
                id: 48,
                title: 'Research Team Lead',
                banner: Banner.BLUE,
                bannerTitle: 'Junior Leadership',
            },
            {
                id: 49,
                title: 'Research Team Deputy',
            },
        ],
    }),
    CreateGroupNode({
        id: 50,
        name: 'Organizing Department',
        leads: [
            {
                id: 51,
                title: 'Organizing Director',
                name: 'Gunga',
                banner: Banner.RED,
                bannerTitle: 'Senior Leadership',
            },
            {
                id: 52,
                title: 'Organizing Deputy',
                name: 'Pickleyme',
                banner: Banner.RED,
                bannerTitle: 'Senior Leadership',
            },
            {
                id: 53,
                title: 'Organizing Deputy',
                banner: Banner.RED,
                bannerTitle: 'Senior Leadership',
            },
        ],
    }),
    CreateGroupNode({
        id: 54,
        name: 'Recruitment Team',
        desc: 'Yada yada yada',
        leads: [
            {
                id: 55,
                title: 'Recruitment Team Lead',
                name: 'Gunga',
                banner: Banner.BLUE,
                bannerTitle: 'Junior Leadership',
                tags: [Tags[3]],
            },
            {
                id: 56,
                title: 'Recruitment Team Lead',
                name: 'Damon',
                banner: Banner.BLUE,
                bannerTitle: 'Junior Leadership',
                tags: [Tags[3]],
            },
            {
                id: 57,
                title: 'Recruitment Team Deputy',
            },
        ],
    }),
    CreateBlankNode({ id: 108 }),
    CreateGroupNode({
        id: 58,
        name: 'Mobilization Team',
        desc: 'Yada yada yada',
        leads: [
            {
                id: 59,
                title: 'Mobilization Team Lead',
                name: 'Frankie',
                banner: Banner.BLUE,
                bannerTitle: 'Junior Leadership',
                tags: [Tags[3]],
            },
            {
                id: 60,
                name: 'Unfilled',
                title: 'Mobilization Team Lead',
                banner: Banner.BLUE,
                bannerTitle: 'Junior Leadership',
                tags: [Tags[3]],
            },
            {
                id: 61,
                title: 'Mobilization Deputy',
                tags: [Tags[3]],
            },
        ],
    }),
    CreateGroupNode({
        id: 62,
        name: 'Western Coalition',
        desc: 'Yada yada yada',
        leads: [
            {
                id: 63,
                title: 'Western Coalition Lead',
                name: 'Dynas',
                banner: Banner.BLUE,
                bannerTitle: 'Junior Leadership',
                tags: [Tags[3]],
            },
            {
                id: 64,
                title: 'Western Coalition Lead',
                name: 'Finnegan',
                banner: Banner.BLUE,
                bannerTitle: 'Junior Leadership',
                tags: [Tags[3]],
            },
            {
                id: 65,
                title: 'Western Coalition Deputy',
                name: 'Jimmy',
            },
        ],
    }),
    CreateGroupNode({
        id: 66,
        name: 'Western State Teams',
    }),
    CreateGroupNode({
        id: 67,
        name: 'Midwest Coalition',
        desc: 'Yada yada yada',
        leads: [
            {
                id: 68,
                title: 'Midwest Coalition Lead',
                name: 'Sam WI',
                banner: Banner.BLUE,
                bannerTitle: 'Junior Leadership',
                tags: [Tags[3]],
            },
            {
                id: 69,
                title: 'Midwest Coalition Lead',
                tags: [Tags[3]],
            },
            {
                id: 70,
                title: 'Midwest Coalition Deputy',
                name: 'Phoenix',
            },
        ],
    }),
    CreateGroupNode({
        id: 71,
        name: 'Midwest State Teams',
    }),
    CreateGroupNode({
        id: 72,
        name: 'Northeastern Coalition',
        desc: 'Yada yada yada',
        leads: [
            {
                id: 73,
                title: 'Northeastern Coalition Lead',
                name: 'Matt',
                tags: [Tags[3]],
            },
            {
                id: 74,
                title: 'Northeastern Coalition Lead',
                name: 'Gyd',
                tags: [Tags[3]],
            },
            {
                id: 75,
                title: 'Northeastern Coalition Deputy',
            },
        ],
    }),
    CreateGroupNode({
        id: 76,
        name: 'Northeast State Teams',
    }),
    CreateGroupNode({
        id: 77,
        name: 'Southern Coalition',
        desc: 'Yada yada yada',
        leads: [
            {
                id: 78,
                title: 'Southern Coalition Lead',
                tags: [Tags[3]],
            },
            {
                id: 79,
                title: 'Southern Coalition Lead',
                tags: [Tags[3]],
            },
            {
                id: 80,
                title: 'Southern Coalition Deputy',
            },
        ],
    }),
    CreateGroupNode({
        id: 81,
        name: 'Southern State Teams',
    }),
    CreateGroupNode({
        id: 82,
        name: 'Technology Department',
        leads: [
            {
                id: 83,
                title: 'Technical Director',
                redacted: true,
                banner: Banner.RED,
                bannerTitle: 'Senior Leadership',
            },
            {
                id: 84,
                title: 'Deputy Technical Director',
                name: 'Adrian',
                banner: Banner.RED,
                bannerTitle: 'Senior Leadership',
            },
            {
                id: 85,
                title: 'Deputy Technical Director',
                name: 'Joops',
                banner: Banner.RED,
                bannerTitle: 'Senior Leadership',
            },
        ],
    }),
    CreateGroupNode({
        id: 86,
        name: 'Discord Engineering Team',
        desc: 'Manages the development of the Progressive Victory Discord bot.',
        leads: [
            {
                id: 87,
                title: 'Discord Eng. Team Lead',
                name: 'Sh3llhound',
                tags: [Tags[2]],
            },
            {
                id: 88,
                title: 'Discord Eng. Team Lead',
                tags: [Tags[2]],
            },
            {
                id: 89,
                title: 'Discord Eng. Team Deputy',
                name: 'Mafia',
            },
        ],
    }),
    CreateGroupNode({
        id: 90,
        name: 'Database Engineering Team',
        desc: 'Manages the development of the Progressive Victory database.',
        leads: [
            {
                id: 91,
                title: 'Database Eng. Team Lead',
                name: 'Rexrath',
                tags: [Tags[2]],
            },
            {
                id: 92,
                title: 'Database Eng. Team Lead',
                tags: [Tags[2]],
            },
            {
                id: 93,
                title: 'Database Eng. Team Deputy',
            },
        ],
    }),
    CreateGroupNode({
        id: 94,
        name: 'Website Engineering Team',
        desc: 'Manages the development of the Progressive Victory website.',
        leads: [
            {
                id: 95,
                title: 'Website Eng. Team Lead',
                tags: [Tags[2]],
            },
            {
                id: 96,
                title: 'Website Eng. Team Lead',
                tags: [Tags[2]],
            },
            {
                id: 97,
                title: 'Website Eng. Team Deputy',
            },
        ],
    }),
    CreateGroupNode({
        id: 98,
        name: 'Moderation Team',
        members: [
            {
                id: 99,
                name: 'Clementine',
                title: 'Moderator',
            },
            {
                id: 100,
                name: 'Finnegan',
                title: 'Moderator',
            },
            {
                id: 101,
                name: 'Jaxonmaxx',
                title: 'Moderator',
            },
            {
                id: 102,
                name: 'Natalie',
                title: 'Moderator',
            },
            {
                id: 103,
                name: 'Noelle',
                title: 'Moderator',
            },
            {
                id: 104,
                name: 'Onby',
                title: 'Moderator',
            },
            {
                id: 105,
                name: 'Starry',
                title: 'Moderator',
            },
            {
                id: 106,
                name: 'Thesunkey',
                title: 'Moderator',
            },
            {
                id: 107,
                name: 'Victoria',
                title: 'Moderator',
            },
        ],
    }),

    CreateGroupNode({
        id: 109,
        name: 'This Week at PV Strike Team',
        desc: 'Manages the weekly publication of the This Week at Progressive Victory newsletter.',
    }),
]

export const orgchartEdges: Edge[] = [
    CreateEdge({ source: 0, target: 1 }),
    CreateEdge({ source: 1, target: 2 }),
    CreateEdge({ source: 1, target: 14 }),
    CreateEdge({ source: 1, target: 30 }),
    CreateEdge({ source: 1, target: 42 }),
    CreateEdge({ source: 1, target: 50 }),
    CreateEdge({ source: 1, target: 82 }),
    CreateEdge({ source: 2, target: 6 }),
    CreateEdge({ source: 2, target: 10 }),
    CreateEdge({ source: 2, target: 98 }),
    CreateEdge({ source: 2, target: 18 }),
    CreateEdge({ source: 14, target: 18 }),
    CreateEdge({ source: 14, target: 22 }),
    CreateEdge({ source: 14, target: 26 }),
    CreateEdge({ source: 30, target: 34 }),
    CreateEdge({ source: 30, target: 38 }),
    CreateEdge({ source: 42, target: 38 }),
    CreateEdge({ source: 42, target: 46 }),
    CreateEdge({ source: 50, target: 54 }),
    CreateEdge({ source: 50, target: 58 }),
    CreateEdge({ source: 62, target: 66 }),
    CreateEdge({ source: 67, target: 71 }),
    CreateEdge({ source: 72, target: 76 }),
    CreateEdge({ source: 77, target: 81 }),
    CreateEdge({ source: 82, target: 86 }),
    CreateEdge({ source: 82, target: 90 }),
    CreateEdge({ source: 82, target: 94 }),
    CreateEdge({ source: 50, target: 108 }),
    CreateEdge({ source: 108, target: 62 }),
    CreateEdge({ source: 108, target: 67 }),
    CreateEdge({ source: 108, target: 72 }),
    CreateEdge({ source: 108, target: 77 }),
    CreateEdge({ source: 18, target: 109 }),
]
