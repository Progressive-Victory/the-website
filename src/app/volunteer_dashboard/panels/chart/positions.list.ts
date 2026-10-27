import { PositionTypes, Position, UserProfile } from './domain/chart.types'
import type { SidebarBodyItemConfig } from '@/components/common/panel/sidebar_list/SidebarBody'

export const positionTypeLabels: Record<PositionTypes, string> = {
    [PositionTypes.POSITION]: 'Position',
    [PositionTypes.GROUP]: 'Group',
}

export const positionTypeOptions = Object.entries(positionTypeLabels).map(
    ([value, label]) => ({ value: Number(value), label })
)

export function getPositionListChildren(
    position: Position,
    positionById: ReadonlyMap<number, Position>
): Position[] {
    if (position.type !== PositionTypes.GROUP) return []
    return [...positionById.values()]
        .filter(({ parentGroupId }) => parentGroupId === position.id)
        .sort((a, b) => a.name.localeCompare(b.name))
}

export function positionListItem(
    position: Position,
    positionById: ReadonlyMap<number, Position>,
    onClick: SidebarBodyItemConfig<Position>['onClick']
): SidebarBodyItemConfig<Position> {
    return {
        key: position.id,
        label: position.name || 'New Position',
        subtitle: positionTypeLabels[position.type],
        tagCount:
            position.type === PositionTypes.GROUP
                ? undefined
                : (position.seats ?? undefined),
        buttonType: position.type === PositionTypes.GROUP ? 'group' : 'default',
        children: getPositionListChildren(position, positionById),
        href: `/volunteer_dashboard/panels/chart?positionId=${position.id}`,
        onClick,
    }
}

export function positionPickerItems(
    positions: Position[],
    query: string
): {
    items: Position[]
    positionById: Map<number, Position>
} {
    const byId = new Map(positions.map((position) => [position.id, position]))
    const included = new Set<number>()
    const includeDescendants = (position: Position) => {
        if (included.has(position.id)) return
        included.add(position.id)
        getPositionListChildren(position, byId).forEach(includeDescendants)
    }
    positions
        .filter(({ name }) =>
            name.toLocaleLowerCase().includes(query.toLocaleLowerCase())
        )
        .forEach(includeDescendants)
    let changed = true
    while (changed) {
        changed = false
        for (const position of positions) {
            if (
                !included.has(position.id) &&
                getPositionListChildren(position, byId).some(({ id }) =>
                    included.has(id)
                )
            ) {
                included.add(position.id)
                changed = true
            }
        }
    }
    const filtered = positions.filter(({ id }) => included.has(id))
    const positionById = new Map(
        filtered.map((position) => [position.id, position])
    )
    const childIds = new Set(
        filtered.flatMap((position) =>
            getPositionListChildren(position, positionById).map(({ id }) => id)
        )
    )
    const items = filtered
        .filter(({ id }) => !childIds.has(id))
        .sort((a, b) => a.name.localeCompare(b.name))
    const visited = new Set<number>()
    const visit = (position: Position) => {
        if (visited.has(position.id)) return
        visited.add(position.id)
        getPositionListChildren(position, positionById).forEach(visit)
    }
    items.forEach(visit)
    for (const position of filtered) {
        if (visited.has(position.id)) continue
        items.push(position)
        visit(position)
    }
    return { items, positionById }
}

export function getUserDisplayName(user: UserProfile | undefined): string {
    if (!user) return 'Unknown'
    if (user.firstName && user.lastName)
        return `${user.firstName} ${user.lastName}`
    const discord = user.discordUsers?.[0]?.username
    if (discord) return `@${discord}`
    return user.preferredName ?? user.email ?? 'Unknown'
}
