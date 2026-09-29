import {
    PositionTypes,
    RelationshipTypes,
    UserProfile,
} from 'pv-contracts/data'

export const positionTypeLabels: Record<PositionTypes, string> = {
    [PositionTypes.POSITION]: 'Position',
    [PositionTypes.GROUP]: 'Group',
}

export const positionTypeOptions = Object.entries(positionTypeLabels).map(
    ([value, label]) => ({ value: Number(value), label })
)

export const relationshipTypeLabels: Record<RelationshipTypes, string> = {
    [RelationshipTypes.OWNER]: 'Owner',
    [RelationshipTypes.MANAGER]: 'Manager',
    [RelationshipTypes.SUPERVISOR]: 'Supervisor',
    [RelationshipTypes.TEAM]: 'Team',
    [RelationshipTypes.ROLE]: 'Role',
    [RelationshipTypes.GROUP]: 'Group',
}

export const relationshipTypeOptions = Object.entries(
    relationshipTypeLabels
).map(([value, label]) => ({ value: Number(value), label }))

export function getUserDisplayName(user: UserProfile | undefined): string {
    if (!user) return 'Unknown'
    if (user.firstName && user.lastName)
        return `${user.firstName} ${user.lastName}`
    const discord = user.discordUsers?.[0]?.username
    if (discord) return `@${discord}`
    if (user.preferredName) return user.preferredName
    if (user.email) return user.email
    return 'Unknown'
}
