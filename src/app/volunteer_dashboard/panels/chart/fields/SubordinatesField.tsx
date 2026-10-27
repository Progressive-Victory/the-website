import { ChartModalPortal } from '../ChartModalPortal'
import { canSetParentGroup } from '../canvas/positions.connections'
import { PositionTypes, type Line, type Position } from '../domain/chart.types'
import { lineEndpoints, resolveLineSources } from '../domain/lineGraph'
import styles from '../page.module.css'
import { SearchModal } from '@/app/volunteer_dashboard/layout/SearchModal'
import { FormGroup } from '@/components/common/forms/FormGroup'
import { cn } from '@/util'
import { useState } from 'react'

export function SubordinatesField({
    position,
    positions,
    lines,
    editing,
    disabled,
    onAdd,
    onRemove,
}: {
    position: Position
    positions: Position[]
    lines: Line[]
    editing: boolean
    disabled: boolean
    onAdd: (id: number) => void
    onRemove: (id: number) => void
}) {
    const [pickerOpen, setPickerOpen] = useState(false)
    const [search, setSearch] = useState('')
    const group = position.type === PositionTypes.GROUP
    const title = group ? 'Group Members' : 'Subordinates'
    const targetIds = new Set(
        lines.flatMap((line) => {
            const { target } = lineEndpoints(line)
            return target.kind === 'anchorpoint' &&
                resolveLineSources(line, lines).some(
                    (source) => source.positionId === position.id
                )
                ? [target.positionId]
                : []
        })
    )
    const members = positions.filter((item) =>
        group ? item.parentGroupId === position.id : targetIds.has(item.id)
    )
    const memberIds = new Set(members.map(({ id }) => id))
    const candidates = positions.filter(
        (item) =>
            item.id !== position.id &&
            !memberIds.has(item.id) &&
            (!group || canSetParentGroup(positions, item.id, position.id)) &&
            item.name.toLowerCase().includes(search.toLowerCase())
    )
    return (
        <section aria-label={title} className={styles.subPositions}>
            <FormGroup title={title}>
                <div className={styles.subPositionsContainer}>
                    {members.length === 0 && !editing && (
                        <div className={styles.subPositionEntryEmpty}>None</div>
                    )}
                    {members.map((member) => (
                        <div
                            key={member.id}
                            className={cn(
                                styles.subPositionEntry,
                                editing && styles.subPositionEntryEditing
                            )}
                        >
                            {editing && (
                                <button
                                    type="button"
                                    className={styles.deleteButton}
                                    disabled={disabled}
                                    aria-label={`Remove ${member.name}`}
                                    onClick={() => onRemove(member.id)}
                                >
                                    −
                                </button>
                            )}
                            <span className={styles.subPositionEntryText}>
                                {member.name || 'New Position'}
                            </span>
                        </div>
                    ))}
                    {editing && (
                        <button
                            type="button"
                            className={styles.addRow}
                            disabled={disabled}
                            onClick={() => setPickerOpen(true)}
                        >
                            <span className={styles.addIcon}>+</span>
                            {group
                                ? 'Add Group Members'
                                : 'Add Subordinate Positions'}
                        </button>
                    )}
                </div>
            </FormGroup>
            <ChartModalPortal>
                <SearchModal
                    open={pickerOpen && editing}
                    onClose={() => {
                        setPickerOpen(false)
                        setSearch('')
                    }}
                    title={group ? 'Add Group Members' : 'Add Subordinates'}
                    subtitle={
                        group
                            ? 'Choose a position to nest in this group.'
                            : 'Choose a position to connect with an outgoing line.'
                    }
                    searchValue={search}
                    onSearchChange={(event) => setSearch(event.target.value)}
                >
                    {candidates.map((candidate) => (
                        <button
                            type="button"
                            key={candidate.id}
                            className={styles.pickerItem}
                            disabled={disabled}
                            onClick={() => {
                                onAdd(candidate.id)
                                setPickerOpen(false)
                                setSearch('')
                            }}
                        >
                            {candidate.name || 'New Position'}
                        </button>
                    ))}
                    {candidates.length === 0 && (
                        <div className={styles.pickerEmpty}>
                            No positions available
                        </div>
                    )}
                </SearchModal>
            </ChartModalPortal>
        </section>
    )
}
