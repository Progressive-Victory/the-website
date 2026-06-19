'use client'

import styles from './page.module.css'
import {
    Form,
    FormGroup,
    FormState,
    TextField,
} from '@/components/common/forms'
import { NavigationButton } from '@/components/common/navigation_stack/navigation_button/NavigationButton'
import Panel from '@/components/common/panel/Panel'
import { Permission, zPermission } from '@/contracts/data'
import { UpdatePermissionRequest } from '@/contracts/requests'
import { PaginatedResponse } from '@/contracts/responses'
import { FetchError } from '@/models'
import { useFetch, usePaginatedSearch } from '@/util/hooks'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import {
    TbLayoutSidebarLeftCollapse,
    TbLayoutSidebarLeftExpand,
} from 'react-icons/tb'
import { useMediaQuery } from 'usehooks-ts'

export default function Page() {
    const queryClient = useQueryClient()
    const { onPatch } = useFetch()

    const [selectedPermission, setSelectedPermission] =
        useState<Permission | null>(null)
    const [sidebarMobileVisible, setSidebarMobileVisible] = useState(true)
    const isDesktop = useMediaQuery('(min-width: 64rem)')

    const [, setFormState] = useState<FormState<Permission> | null>(null)

    const { query: searchQuery, search } = usePaginatedSearch<Permission>(
        '/permissions',
        zPermission
    )

    const updateMutation = useMutation<
        Permission,
        FetchError,
        {
            id: number
            permission: Permission
            request: UpdatePermissionRequest
        },
        Permission | undefined
    >({
        mutationFn: ({ id, request }) =>
            onPatch<Permission>(`/permissions/${id}`, request, zPermission),
        onMutate: ({ id, permission }) => {
            const prev = searchQuery.data?.data?.find((prev) => prev.id == id)
            setSelectedPermission(permission)
            queryClient.setQueryData(
                ['/permissions', search],
                (res: PaginatedResponse<Permission>) => ({
                    ...res,
                    data: res.data.map((prev) =>
                        prev.id == permission.id ? permission : prev
                    ),
                })
            )
            return prev
        },
        onError: (error, _variables, prev) => {
            console.error(error)
            setSelectedPermission(prev ?? null)
            queryClient.setQueryData(
                [`/permissions`, search],
                (res: PaginatedResponse<Permission>) => ({
                    ...res,
                    data: res.data.map((permission) =>
                        permission.id == prev?.id ? prev : permission
                    ),
                })
            )
        },
        onSuccess: (data) => {
            setSelectedPermission(data)
            queryClient.setQueryData(
                [`/permissions`, search],
                (res: PaginatedResponse<Permission>) => ({
                    ...res,
                    data: res.data.map((permission) =>
                        permission.id == data.id ? data : permission
                    ),
                })
            )
        },
        onSettled: () =>
            queryClient.invalidateQueries({
                queryKey: ['/permissions', search],
            }),
    })

    const handleSave = (permission: Permission) => {
        updateMutation.mutate({
            id: permission.id,
            permission,
            request: { name: permission.name },
        })
    }

    const [panelOpen, setPanelOpen] = useState(false)
    const onTogglePanel = () => setPanelOpen((previous) => !previous)

    const testElementCount = 42
    const permissions = searchQuery.data?.data ?? []

    return (
        <Panel
            includeSidebar
            sidebarWidth="24rem"
            sidebarClassName={styles.sidebarBg}
            sidebarMobileVisible={isDesktop || sidebarMobileVisible}
            label="Test"
            prominentHeaderRight={
                <>
                    <button
                        aria-label={panelOpen ? 'Hide Filters' : 'Show Filters'}
                        className={styles.iconToggleButton}
                        onClick={onTogglePanel}
                        title={panelOpen ? 'Hide Filters' : 'Show Filters'}
                        type="button"
                    >
                        {panelOpen ? (
                            <TbLayoutSidebarLeftExpand
                                size="20"
                                style={{ strokeWidth: 2 }}
                            />
                        ) : (
                            <TbLayoutSidebarLeftCollapse
                                size="20"
                                style={{ strokeWidth: 2 }}
                            />
                        )}
                    </button>
                </>
            }
            sidebarBody={
                <>
                    {permissions.map((permission) => (
                        <NavigationButton
                            key={permission.id}
                            active={selectedPermission?.id === permission.id}
                            href={`/admin/panels/test?permissionId=${permission.id}`}
                            label={permission.name}
                            onClick={(event) => {
                                event.preventDefault()
                                setSelectedPermission(permission)
                                if (!isDesktop) {
                                    setSidebarMobileVisible(false)
                                }
                            }}
                            showIndicator={false}
                            className={styles.permissionNavigationButton}
                        />
                    ))}
                    {Array.from({ length: testElementCount }, (_, index) => (
                        <div className={styles.element} key={index}>
                            Test
                        </div>
                    ))}
                </>
            }
        >
            <div className={styles.detailPane}>
                {!isDesktop && !sidebarMobileVisible ? (
                    <button
                        className={styles.mobileBackButton}
                        onClick={() => setSidebarMobileVisible(true)}
                        type="button"
                    >
                        Permissions
                    </button>
                ) : null}
                {selectedPermission ? (
                    <Form<Permission>
                        key={selectedPermission.id}
                        form={selectedPermission}
                        title={selectedPermission.name}
                        saving={updateMutation.isPending}
                        onUpdate={setFormState}
                        onSave={handleSave}
                    >
                        <FormGroup title="Details">
                            <TextField label="Name" field="name" required />
                        </FormGroup>
                    </Form>
                ) : (
                    <div className={styles.emptyState}>
                        No permission selected
                    </div>
                )}
            </div>
        </Panel>
    )
}
