/* A number of committees can be defined up to the number of icons. */
import { BannerColor } from '../components/banner'
import { createBlankNode } from '../components/blankNode'
import { createEdge } from '../components/edge'
import { createGroupNode } from '../components/group'
import { createPositionNode } from '../components/position'
import { Tag } from '../components/tag'
import { Edge, type Node } from '@xyflow/react'

export const tags: Tag[] = [
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
    createPositionNode({
        id: 0,
        title: 'Executive Director',
        name: 'Sam Dryzmala',
        bannerColor: BannerColor.RED,
        bannerTitle: 'Senior Leadership',
    }),
    createPositionNode({
        id: 1,
        title: 'Deputy Executive Director',
        name: 'Benjamin Gilbert-Lif',
        bannerColor: BannerColor.RED,
        bannerTitle: 'Senior Leadership',
    }),
    createGroupNode({
        id: 2,
        name: 'Community Department',
        leads: [
            {
                id: 3,
                title: 'Community Relations Director',
                name: 'Auntifa',
                bannerColor: BannerColor.RED,
                bannerTitle: 'Senior Leadership',
            },
            {
                id: 4,
                title: 'Community Mananger',
                name: 'Jenywlfersn',
                bannerColor: BannerColor.BLUE,
                bannerTitle: 'Junior Leadership',
                tags: [tags[0], tags[1]],
            },
            {
                id: 5,
                title: 'Community Manager',
                bannerColor: BannerColor.BLUE,
                bannerTitle: 'Junior Leadership',
                tags: [tags[0], tags[1]],
            },
        ],
    }),
    createGroupNode({
        id: 6,
        name: 'Welcome Team',
        desc: '',
        leads: [
            {
                id: 7,
                title: 'Welcome Team Lead',
                name: 'Monarch',
                bannerColor: BannerColor.BLUE,
                bannerTitle: 'Junior Leadership',
                tags: [tags[0]],
            },
            {
                id: 8,
                title: 'Welcome Team Lead',
                bannerColor: BannerColor.BLUE,
                bannerTitle: 'Junior Leadership',
                tags: [tags[0]],
            },

            {
                id: 9,
                title: 'Welcome Team Deputy',
            },
        ],
    }),
    createGroupNode({
        id: 10,
        name: 'Events Team',
        desc: '',
        leads: [
            {
                id: 11,
                title: 'Events Team Lead',
                name: 'BrewMasterCraft',
                bannerColor: BannerColor.BLUE,
                bannerTitle: 'Junior Leadership',
                tags: [tags[0]],
            },
            {
                id: 12,
                title: 'Events Team Lead',
                bannerColor: BannerColor.BLUE,
                bannerTitle: 'Junior Leadership',
                tags: [tags[0]],
            },
            {
                id: 13,
                title: 'Events Team Deputy',
                name: 'Em',
            },
        ],
    }),
    createGroupNode({
        id: 14,
        name: 'Media Department',
        leads: [
            {
                id: 15,
                title: 'Media Director',
                name: 'Aussy',
                bannerColor: BannerColor.RED,
                bannerTitle: 'Senior Leadership',
            },
            {
                id: 16,
                title: 'Deputy Media Director',
                name: 'LeeLoo',
                bannerColor: BannerColor.RED,
                bannerTitle: 'Senior Leadership',
            },
            {
                id: 17,
                title: 'Deputy Media Director',
                bannerColor: BannerColor.RED,
                bannerTitle: 'Senior Leadership',
            },
        ],
    }),
    createGroupNode({
        id: 18,
        name: 'Writing Team',
        desc: '',
        leads: [
            {
                id: 19,
                title: 'Writing Team Lead',
                name: 'Dynas',
                bannerColor: BannerColor.BLUE,
                bannerTitle: 'Junior Leadership',
                tags: [tags[0], tags[1]],
            },
            {
                id: 20,
                title: 'Writing Team Lead',
                name: 'AJ',
                bannerColor: BannerColor.BLUE,
                bannerTitle: 'Junior Leadership',
                tags: [tags[0], tags[1]],
            },
            {
                id: 21,
                title: 'Writing Team Deputy',
                name: 'Jam',
                tags: [tags[0], tags[1]],
            },
        ],
    }),
    createGroupNode({
        id: 22,
        name: 'Audio-Video Team',
        desc: '',
        leads: [
            {
                id: 23,
                title: 'Audio-Video Team Lead',
                name: 'Vezanmatics',
                bannerColor: BannerColor.BLUE,
                bannerTitle: 'Junior Leadership',
                tags: [tags[1]],
            },
            {
                id: 24,
                title: 'Audio-Video Team Lead',
                bannerColor: BannerColor.BLUE,
                bannerTitle: 'Junior Leadership',
                tags: [tags[1]],
            },
            {
                id: 25,
                title: 'Audio-Video Team Deputy',
            },
        ],
    }),
    createGroupNode({
        id: 26,
        name: 'Design Team',
        desc: '',
        leads: [
            {
                id: 27,
                title: 'Events Team Lead',
                name: 'Unfilled',
                bannerColor: BannerColor.BLUE,
                bannerTitle: 'Junior Leadership',
                tags: [tags[1]],
            },
            {
                id: 28,
                title: 'Events Team Lead',
                name: 'Unfilled',
                bannerColor: BannerColor.BLUE,
                bannerTitle: 'Junior Leadership',
                tags: [tags[1]],
            },
            {
                id: 29,
                title: 'Events Team Lead',
                name: 'Unfilled',
            },
        ],
    }),
    createGroupNode({
        id: 30,
        name: 'Operations Department',
        leads: [
            {
                id: 31,
                title: 'Operations Director',
                name: 'Jay',
                bannerColor: BannerColor.RED,
                bannerTitle: 'Senior Leadership',
            },
            {
                id: 32,
                title: 'Operations Deputy',
                name: 'Unfilled',
                bannerColor: BannerColor.RED,
                bannerTitle: 'Senior Leadership',
            },
            {
                id: 33,
                title: 'Operations Deputy',
                name: 'Unfilled',
                bannerColor: BannerColor.RED,
                bannerTitle: 'Senior Leadership',
            },
        ],
    }),
    createGroupNode({
        id: 34,
        name: 'Fundraising Team',
        desc: '',
        leads: [
            {
                id: 35,
                title: 'Fundraising Team Lead',
                name: 'Brewmastercraft',
                bannerColor: BannerColor.BLUE,
                bannerTitle: 'Junior Leadership',
            },
            {
                id: 36,
                title: 'Fundraising Team Lead',
                bannerColor: BannerColor.BLUE,
                bannerTitle: 'Junior Leadership',
            },
            {
                id: 37,
                title: 'Fundraising Team Deputy',
            },
        ],
    }),
    createGroupNode({
        id: 38,
        name: 'Documentation Team',
        desc: '',
        leads: [
            {
                id: 39,
                title: 'Documentation Lead',
                bannerColor: BannerColor.BLUE,
                bannerTitle: 'Junior Leadership',
            },
            {
                id: 40,
                title: 'Documentation Lead',
                bannerColor: BannerColor.BLUE,
                bannerTitle: 'Junior Leadership',
            },
            {
                id: 41,
                title: 'Documentation Deputy',
            },
        ],
    }),
    createGroupNode({
        id: 42,
        name: 'Infrastructure Department',
        leads: [
            {
                id: 43,
                title: 'Infrastructure Director',
                name: 'Kianna',
                bannerColor: BannerColor.RED,
                bannerTitle: 'Senior Leadership',
            },
            {
                id: 44,
                title: 'Deputy Infrastructure Director',
                bannerColor: BannerColor.RED,
                bannerTitle: 'Senior Leadership',
            },
            {
                id: 45,
                title: 'Deputy Infrastructure Director',
                bannerColor: BannerColor.RED,
                bannerTitle: 'Senior Leadership',
            },
        ],
    }),
    createGroupNode({
        id: 46,
        name: 'Research Team',
        desc: '',
        leads: [
            {
                id: 47,
                title: 'Research Team Lead',
                name: 'Phoenix',
                bannerColor: BannerColor.BLUE,
                bannerTitle: 'Junior Leadership',
            },
            {
                id: 48,
                title: 'Research Team Lead',
                bannerColor: BannerColor.BLUE,
                bannerTitle: 'Junior Leadership',
            },
            {
                id: 49,
                title: 'Research Team Deputy',
            },
        ],
    }),
    createGroupNode({
        id: 50,
        name: 'Organizing Department',
        leads: [
            {
                id: 51,
                title: 'Organizing Director',
                name: 'Gunga',
                bannerColor: BannerColor.RED,
                bannerTitle: 'Senior Leadership',
            },
            {
                id: 52,
                title: 'Organizing Deputy',
                name: 'Pickleyme',
                bannerColor: BannerColor.RED,
                bannerTitle: 'Senior Leadership',
            },
            {
                id: 53,
                title: 'Organizing Deputy',
                bannerColor: BannerColor.RED,
                bannerTitle: 'Senior Leadership',
            },
        ],
    }),
    createGroupNode({
        id: 54,
        name: 'Recruitment Team',
        desc: '',
        leads: [
            {
                id: 55,
                title: 'Recruitment Team Lead',
                name: 'Gunga',
                bannerColor: BannerColor.BLUE,
                bannerTitle: 'Junior Leadership',
                tags: [tags[3]],
            },
            {
                id: 56,
                title: 'Recruitment Team Lead',
                name: 'Damon',
                bannerColor: BannerColor.BLUE,
                bannerTitle: 'Junior Leadership',
                tags: [tags[3]],
            },
            {
                id: 57,
                title: 'Recruitment Team Deputy',
            },
        ],
    }),
    createBlankNode({ id: 108 }),
    createGroupNode({
        id: 58,
        name: 'Mobilization Team',
        desc: '',
        leads: [
            {
                id: 59,
                title: 'Mobilization Team Lead',
                name: 'Frankie',
                bannerColor: BannerColor.BLUE,
                bannerTitle: 'Junior Leadership',
                tags: [tags[3]],
            },
            {
                id: 60,
                name: 'Unfilled',
                title: 'Mobilization Team Lead',
                bannerColor: BannerColor.BLUE,
                bannerTitle: 'Junior Leadership',
                tags: [tags[3]],
            },
            {
                id: 61,
                title: 'Mobilization Deputy',
                tags: [tags[3]],
            },
        ],
    }),
    createGroupNode({
        id: 62,
        name: 'Western Coalition',
        desc: '',
        leads: [
            {
                id: 63,
                title: 'Western Coalition Lead',
                name: 'Dynas',
                bannerColor: BannerColor.BLUE,
                bannerTitle: 'Junior Leadership',
                tags: [tags[3]],
            },
            {
                id: 64,
                title: 'Western Coalition Lead',
                name: 'Finnegan',
                bannerColor: BannerColor.BLUE,
                bannerTitle: 'Junior Leadership',
                tags: [tags[3]],
            },
            {
                id: 65,
                title: 'Western Coalition Deputy',
                name: 'Jimmy',
            },
        ],
    }),
    createGroupNode({
        id: 66,
        name: 'Western State Teams',
    }),
    createGroupNode({
        id: 67,
        name: 'Midwest Coalition',
        desc: '',
        leads: [
            {
                id: 68,
                title: 'Midwest Coalition Lead',
                name: 'Sam WI',
                bannerColor: BannerColor.BLUE,
                bannerTitle: 'Junior Leadership',
                tags: [tags[3]],
            },
            {
                id: 69,
                title: 'Midwest Coalition Lead',
                tags: [tags[3]],
            },
            {
                id: 70,
                title: 'Midwest Coalition Deputy',
                name: 'Phoenix',
            },
        ],
    }),
    createGroupNode({
        id: 71,
        name: 'Midwest State Teams',
    }),
    createGroupNode({
        id: 72,
        name: 'Northeastern Coalition',
        desc: '',
        leads: [
            {
                id: 73,
                title: 'Northeastern Coalition Lead',
                name: 'Matt',
                tags: [tags[3]],
            },
            {
                id: 74,
                title: 'Northeastern Coalition Lead',
                name: 'Gyd',
                tags: [tags[3]],
            },
            {
                id: 75,
                title: 'Northeastern Coalition Deputy',
            },
        ],
    }),
    createGroupNode({
        id: 76,
        name: 'Northeast State Teams',
    }),
    createGroupNode({
        id: 77,
        name: 'Southern Coalition',
        desc: '',
        leads: [
            {
                id: 78,
                title: 'Southern Coalition Lead',
                tags: [tags[3]],
            },
            {
                id: 79,
                title: 'Southern Coalition Lead',
                tags: [tags[3]],
            },
            {
                id: 80,
                title: 'Southern Coalition Deputy',
            },
        ],
    }),
    createGroupNode({
        id: 81,
        name: 'Southern State Teams',
    }),
    createGroupNode({
        id: 82,
        name: 'Technology Department',
        leads: [
            {
                id: 83,
                title: 'Technical Director',
                redacted: true,
                bannerColor: BannerColor.RED,
                bannerTitle: 'Senior Leadership',
            },
            {
                id: 84,
                title: 'Deputy Technical Director',
                name: 'Adrian',
                bannerColor: BannerColor.RED,
                bannerTitle: 'Senior Leadership',
            },
            {
                id: 85,
                title: 'Deputy Technical Director',
                name: 'Joops',
                bannerColor: BannerColor.RED,
                bannerTitle: 'Senior Leadership',
            },
        ],
    }),
    createGroupNode({
        id: 86,
        name: 'Discord Engineering Team',
        desc: 'Manages the development of the Progressive Victory Discord bot.',
        leads: [
            {
                id: 87,
                title: 'Discord Eng. Team Lead',
                name: 'Sh3llhound',
                tags: [tags[2]],
            },
            {
                id: 88,
                title: 'Discord Eng. Team Lead',
                tags: [tags[2]],
            },
            {
                id: 89,
                title: 'Discord Eng. Team Deputy',
                name: 'Mafia',
            },
        ],
    }),
    createGroupNode({
        id: 90,
        name: 'Database Engineering Team',
        desc: 'Manages the development of the Progressive Victory database.',
        leads: [
            {
                id: 91,
                title: 'Database Eng. Team Lead',
                name: 'Rexrath',
                tags: [tags[2]],
            },
            {
                id: 92,
                title: 'Database Eng. Team Lead',
                tags: [tags[2]],
            },
            {
                id: 93,
                title: 'Database Eng. Team Deputy',
            },
        ],
    }),
    createGroupNode({
        id: 94,
        name: 'Website Engineering Team',
        desc: 'Manages the development of the Progressive Victory website.',
        leads: [
            {
                id: 95,
                title: 'Website Eng. Team Lead',
                tags: [tags[2]],
            },
            {
                id: 96,
                title: 'Website Eng. Team Lead',
                tags: [tags[2]],
            },
            {
                id: 97,
                title: 'Website Eng. Team Deputy',
            },
        ],
    }),
    createGroupNode({
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

    createGroupNode({
        id: 109,
        name: 'This Week at PV Strike Team',
        desc: 'Manages the weekly publication of the This Week at Progressive Victory newsletter.',
    }),
]

export const orgchartEdges: Edge[] = [
    createEdge({ source: 0, target: 1 }),
    createEdge({ source: 1, target: 2 }),
    createEdge({ source: 1, target: 14 }),
    createEdge({ source: 1, target: 30 }),
    createEdge({ source: 1, target: 42 }),
    createEdge({ source: 1, target: 50 }),
    createEdge({ source: 1, target: 82 }),
    createEdge({ source: 2, target: 6 }),
    createEdge({ source: 2, target: 10 }),
    createEdge({ source: 2, target: 98 }),
    createEdge({ source: 2, target: 18 }),
    createEdge({ source: 14, target: 18 }),
    createEdge({ source: 14, target: 22 }),
    createEdge({ source: 14, target: 26 }),
    createEdge({ source: 30, target: 34 }),
    createEdge({ source: 30, target: 38 }),
    createEdge({ source: 42, target: 38 }),
    createEdge({ source: 42, target: 46 }),
    createEdge({ source: 50, target: 54 }),
    createEdge({ source: 50, target: 58 }),
    createEdge({ source: 62, target: 66 }),
    createEdge({ source: 67, target: 71 }),
    createEdge({ source: 72, target: 76 }),
    createEdge({ source: 77, target: 81 }),
    createEdge({ source: 82, target: 86 }),
    createEdge({ source: 82, target: 90 }),
    createEdge({ source: 82, target: 94 }),
    createEdge({ source: 50, target: 108 }),
    createEdge({ source: 108, target: 62 }),
    createEdge({ source: 108, target: 67 }),
    createEdge({ source: 108, target: 72 }),
    createEdge({ source: 108, target: 77 }),
    createEdge({ source: 18, target: 109 }),
]
