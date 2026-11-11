export interface Coalition {
    name: string
    color: string
    states: string[]
}

export const COALITIONS: Coalition[] = [
    {
        name: 'Southern Coalition',
        color: '#C0392B',
        states: ['AR', 'LA', 'MS', 'AL', 'GA', 'SC', 'FL', 'PR'],
    },
    {
        name: 'Appalachian Coalition',
        color: '#F78FC2',
        states: ['WV', 'KY', 'TN'],
    },
    {
        name: 'Mid-Atlantic Coalition',
        color: '#C9A8DC',
        states: ['VA', 'NC', 'MD', 'DC'],
    },
    {
        name: 'Northeastern Coalition',
        color: '#1560BD',
        states: ['NY', 'PA', 'NJ', 'DE'],
    },
    {
        name: 'New England Coalition',
        color: '#4FC3E0',
        states: ['ME', 'NH', 'VT', 'MA', 'RI', 'CT'],
    },
    {
        name: 'Pacific Northwestern Coalition',
        color: '#F7E11E',
        states: ['WA', 'OR', 'ID', 'AK'],
    },
    {
        name: 'Western Coalition',
        color: '#F5A65B',
        states: ['CA', 'NV', 'HI'],
    },
    {
        name: 'Southwestern Coalition',
        color: '#EE6E5A',
        states: ['AZ', 'NM', 'TX', 'OK'],
    },
    {
        name: 'Mountain Coalition',
        color: '#B07423',
        states: ['MT', 'WY', 'UT', 'CO'],
    },
    {
        name: 'Midwestern Coalition',
        color: '#2FAF7E',
        states: ['ND', 'SD', 'NE', 'KS', 'MN', 'IA', 'MO'],
    },
    {
        name: 'Rust Belt Coalition',
        color: '#8E44AD',
        states: ['WI', 'MI', 'IL', 'IN', 'OH'],
    },
]

/** Fallback for any state that isn't assigned to a coalition. */
export const UNAFFILIATED_COLOR = '#D6E4E8'

export const COALITION_BY_STATE = new Map(
    COALITIONS.flatMap((coalition) =>
        coalition.states.map((code) => [code, coalition] as const)
    )
)
