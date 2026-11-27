import { PositionTypes, type Position } from '../api/domain/chart.types'
import { reparentPosition } from '../api/domain/chartDocument.operations'
import { canSetParentGroup } from '../canvas/positions.connections'
import { DropdownRow } from '@/components/common/list'

const getParentGroup = (form: Position) => form.parentGroupId ?? ''

export function GroupMembershipField({
    positions,
    position,
}: {
    positions: Position[]
    position: Position
}) {
    return (
        <DropdownRow
            label="Parent group"
            getter={getParentGroup}
            setter={(form: Position, value) =>
                reparentPosition(
                    positions,
                    form,
                    value === '' ? undefined : Number(value)
                )
            }
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
