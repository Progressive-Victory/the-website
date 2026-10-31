'use client'

import type { Position } from '../domain/chart.types'
import styles from '../page.module.css'
import {
    FormFieldProps,
    useConfigure,
} from '@/components/common/forms/FormField'
import { Switch } from '@/components/common/switch/Switch'
import { cn, parseErrorMessage } from '@/util'
import { usePaginatedSearch } from '@/util/hooks'
import { zPermission } from 'pv-contracts/data'
import { SortDirection } from 'pv-contracts/requests'
import { useCallback } from 'react'

export function PermissionsField(
    props: FormFieldProps<Position, Position['permissions']>
) {
    const { getter, onChange, readonly, disabled } = useConfigure(
        props,
        useCallback(() => true, [])
    )
    const { query } = usePaginatedSearch('/permissions', zPermission, {
        all: true,
        search: { sort: SortDirection.ASC, limit: 100 },
    })

    const permissions = [...(query.data?.data ?? [])].sort(
        (a, b) => a.id - b.id
    )
    const assignedPermissions = getter(props.dynamic!.form) ?? []
    const assignedPermissionIds = new Set(
        assignedPermissions.map((permission) => permission.id)
    )

    return (
        <div className={styles.subPositions}>
            <div className={styles.subPositionsContainer}>
                {query.isPending ? (
                    <div className={styles.subPositionEntryEmpty}>
                        Loading permissions...
                    </div>
                ) : query.error ? (
                    <div className={styles.subPositionEntryEmpty}>
                        Error: {parseErrorMessage(query.error)}
                    </div>
                ) : (
                    <>
                        {permissions.length === 0 && (
                            <div className={styles.subPositionEntryEmpty}>
                                No permissions
                            </div>
                        )}
                        {permissions.map((permission) => (
                            <div
                                key={permission.id}
                                className={cn(
                                    styles.subPositionEntry,
                                    styles.permissionEntry
                                )}
                            >
                                <span className={styles.subPositionEntryText}>
                                    {permission.name}
                                </span>
                                {!readonly ? (
                                    <Switch
                                        type="long"
                                        ariaLabel={permission.name}
                                        checked={assignedPermissionIds.has(
                                            permission.id
                                        )}
                                        disabled={disabled}
                                        onCheckedChange={(checked) => {
                                            onChange(
                                                checked
                                                    ? [
                                                          ...assignedPermissions,
                                                          permission,
                                                      ]
                                                    : assignedPermissions.filter(
                                                          (assigned) =>
                                                              assigned.id !==
                                                              permission.id
                                                      )
                                            )
                                        }}
                                    />
                                ) : (
                                    <span className={styles.subPositionTags}>
                                        <span
                                            className={styles.subPositionTag}
                                            data-enabled={assignedPermissionIds.has(
                                                permission.id
                                            )}
                                        >
                                            {assignedPermissionIds.has(
                                                permission.id
                                            )
                                                ? 'Yes'
                                                : 'No'}
                                        </span>
                                    </span>
                                )}
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    )
}
