import { canSetParentGroup } from '../canvas/positions.connections'
import { PositionTypes, type Position } from '../domain/chart.types'
import { DropDownField } from '@/components/common/forms'
import type { FormFieldProps } from '@/components/common/forms/FormField'
import { useCallback } from 'react'

const getParentGroup = (form: Position) => form.parentGroupId ?? ''

export function reparentPosition(
    positions: Position[],
    form: Position,
    parentGroupId: number | undefined
): Position {
    const absoluteOrigin = (id: number | undefined) => {
        let x = 0
        let y = 0
        const visited = new Set<number>()
        while (id !== undefined && !visited.has(id)) {
            visited.add(id)
            const group = positions.find((item) => item.id === id)
            x += group?.coordinates?.x ?? 0
            y += group?.coordinates?.y ?? 0
            id = group?.parentGroupId
        }
        return { x, y }
    }
    const before = absoluteOrigin(form.parentGroupId)
    const after = absoluteOrigin(parentGroupId)
    const coordinates =
        positions.find(({ id }) => id === form.id)?.coordinates ??
        form.coordinates
    return {
        ...form,
        parentGroupId,
        coordinates: {
            x: (coordinates?.x ?? 0) + before.x - after.x,
            y: (coordinates?.y ?? 0) + before.y - after.y,
        },
    }
}

export function GroupMembershipField({
    positions,
    position,
    ...fieldProps
}: {
    positions: Position[]
    position: Position
} & Omit<
    FormFieldProps<Position, string | number | null | undefined>,
    'label'
>) {
    const setParentGroup = useCallback(
        (form: Position, value: string | number | null | undefined) => {
            const parentGroupId = value === '' ? undefined : Number(value)
            return reparentPosition(positions, form, parentGroupId)
        },
        [positions]
    )
    return (
        <DropDownField<Position>
            {...fieldProps}
            label="Parent group"
            getter={getParentGroup}
            setter={setParentGroup}
            options={[
                { value: '', label: 'None (canvas)' },
                ...positions
                    .filter(
                        (item) =>
                            item.type === PositionTypes.GROUP &&
                            canSetParentGroup(positions, position.id, item.id)
                    )
                    .map((item) => ({ value: item.id, label: item.name })),
            ]}
        />
    )
}
