'use client'

import type { Position } from '../api/domain/chart.types'
import {
    AddListEmptyRow,
    List,
    ToggleRow,
    type ListFormState,
} from '@/components/common/list'
import { parseErrorMessage } from '@/util'
import { usePaginatedSearch } from '@/util/hooks'
import { zPermission } from 'pv-contracts/data'
import { SortDirection } from 'pv-contracts/requests'

export function PermissionsField({ dynamic }: { dynamic?: ListFormState }) {
    const { query } = usePaginatedSearch('/permissions', zPermission, {
        all: true,
        search: { sort: SortDirection.ASC, limit: 100 },
    })

    const permissions = [...(query.data?.data ?? [])].sort(
        (a, b) => a.id - b.id
    )

    const renderRows = () => {
        if (query.isPending)
            return <AddListEmptyRow>Loading permissions...</AddListEmptyRow>
        if (query.error)
            return (
                <AddListEmptyRow>
                    <span role="alert">
                        Error: {parseErrorMessage(query.error)}
                    </span>
                </AddListEmptyRow>
            )
        if (permissions.length === 0)
            return <AddListEmptyRow>No permissions</AddListEmptyRow>

        return permissions.map((permission) => (
            <ToggleRow
                key={permission.id}
                label={permission.name}
                getter={(form: Position) =>
                    form.permissions.some(
                        (assigned) => assigned.id === permission.id
                    )
                }
                setter={(form: Position, checked) => ({
                    ...form,
                    permissions: checked
                        ? [
                              ...form.permissions.filter(
                                  (assigned) => assigned.id !== permission.id
                              ),
                              permission,
                          ]
                        : form.permissions.filter(
                              (assigned) => assigned.id !== permission.id
                          ),
                })}
            />
        ))
    }

    return (
        <List title="Permissions" dynamic={dynamic}>
            {renderRows()}
        </List>
    )
}
