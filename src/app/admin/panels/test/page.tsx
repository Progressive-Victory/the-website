'use client'

import styles from './page.module.css'
import { DropdownButton, DropdownOverlay } from '@/components/common'
import {
    Form,
    FormGroup,
    FormState,
    TextField,
} from '@/components/common/forms'
import { NavigationButton } from '@/components/common/navigation_stack/navigation_button/NavigationButton'
import Panel from '@/components/common/panel/Panel'
import { Permission, zPermission } from '@/contracts/data'
import { SearchRequest, UpdatePermissionRequest } from '@/contracts/requests'
import { PaginatedResponse } from '@/contracts/responses'
import { FetchError } from '@/models'
import { useFetch, usePaginatedSearch } from '@/util/hooks'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import cx from 'classnames'
import { useCallback, useEffect, useState } from 'react'
import {
    FiChevronLeft,
    FiChevronRight,
    FiChevronsLeft,
    FiChevronsRight,
} from 'react-icons/fi'
import { IoMdOptions } from 'react-icons/io'
import { IoClose } from 'react-icons/io5'
import { IconType } from 'react-icons/lib'
import { useMediaQuery } from 'usehooks-ts'

export default function Page() {
    const queryClient = useQueryClient()
    const { onPatch } = useFetch()

    const [selectedPermission, setSelectedPermission] =
        useState<Permission | null>(null)
    const [sidebarMobileVisible, setSidebarMobileVisible] = useState(true)
    const isDesktop = useMediaQuery('(min-width: 64rem)')

    const [, setFormState] = useState<FormState<Permission> | null>(null)

    const {
        query: searchQuery,
        search,
        onSearch,
    } = usePaginatedSearch<Permission>('/permissions', zPermission)

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

    const permissions = searchQuery.data?.data ?? []
    const resultCount = searchQuery.data?.count

    return (
        <Panel
            includeSidebar
            largeTitle
            sidebarSearch={<SearchBar search={search} onSearch={onSearch} />}
            sidebarWidth="24rem"
            sidebarClassName={styles.sidebarBg}
            sidebarMobileVisible={isDesktop || sidebarMobileVisible}
            label="Test"
            showScrollbar={false}
            sidebarFooter={
                <Footer
                    search={search}
                    count={resultCount}
                    isPending={searchQuery.isPending}
                    onSearch={onSearch}
                />
            }
            prominentHeaderRight={
                <>
                    <DropdownButton
                        type="button"
                        label="List Options"
                        buttonVariant="minimal"
                        menu={({ closeDropdown }) => (
                            <DropdownOverlay
                                className={styles.chartOptionsBox}
                                label="List Options"
                                onClose={() => {
                                    closeDropdown()
                                }}
                                bodyClassName={styles.dropdownOverlay}
                                body={<></>}
                            />
                        )}
                    />

                    <button
                        aria-label={panelOpen ? 'Hide Filters' : 'Show Filters'}
                        className={styles.iconToggleButton}
                        onClick={onTogglePanel}
                        title={panelOpen ? 'Hide Filters' : 'Show Filters'}
                        type="button"
                    >
                        {panelOpen ? (
                            <IoClose size="20" />
                        ) : (
                            <IoMdOptions size="20" />
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

interface SearchBarProps {
    search: SearchRequest
    onSearch: (search: SearchRequest) => void
}

function SearchBar({ search, onSearch }: SearchBarProps) {
    return (
        <div className={styles.searchInput}>
            <input
                type="text"
                name="search"
                id="search"
                placeholder="Search..."
                defaultValue={search.query ?? ''}
                onInput={(event) =>
                    onSearch({
                        ...search,
                        query: event.currentTarget.value,
                        page: 0,
                    })
                }
            />
        </div>
    )
}

interface FooterProps {
    search: SearchRequest
    count?: number
    isPending: boolean
    onSearch: (search: SearchRequest) => void
}

function Footer({
    search,
    count: resultCount,
    isPending,
    onSearch,
}: FooterProps) {
    const [value, setValue] = useState('')

    const page = search.page ?? 0
    const pageSize = search.limit ?? 25
    const count = resultCount ?? 0
    const disabled = isPending

    const pageCount = Math.ceil(count / pageSize)
    const canNavigate = pageCount > 1
    const maxPage = pageCount - 1

    const onChange = useCallback(
        (page: number) => onSearch({ ...search, page }),
        [onSearch, search]
    )

    const handleChangeValue = (value: string) => {
        if (!value || (/^\d+$/.test(value) && value.length < 10))
            setValue(value)
    }

    const handleSubmit = () => {
        const newPage = +value - 1
        if (0 <= newPage && newPage <= maxPage) onChange(newPage)
        else setValue((page + 1).toString())
    }

    useEffect(() => {
        setValue((page + 1).toString())
    }, [page])

    useEffect(() => {
        if (page < 0) onChange(0)
        else if (maxPage >= 0 && page > maxPage) onChange(maxPage)
    }, [page, maxPage, onChange])

    const PaginationArrow = ({
        onClick,
        icon: Icon,
        title,
        enabled,
    }: {
        onClick: () => void
        icon: IconType
        title: string
        enabled: boolean
    }) => (
        <a
            className={cx(
                styles.arrow,
                enabled ? styles.enabled : styles.disabled
            )}
            onClick={() => enabled && onClick()}
            title={title}
        >
            <Icon size={20} />
        </a>
    )

    if (resultCount == null) return null

    return (
        <div className={styles.pageSelectContainer}>
            <div className={styles.pageSelect}>
                <div className={styles.pageSelectButtons}>
                    <PaginationArrow
                        onClick={() => onChange(0)}
                        icon={FiChevronsLeft}
                        title="First"
                        enabled={canNavigate && page > 0}
                    />
                    <PaginationArrow
                        onClick={() => onChange(page - 1)}
                        icon={FiChevronLeft}
                        title="Previous"
                        enabled={canNavigate && page > 0}
                    />
                    <form
                        className={styles.pageSelectForm}
                        onSubmit={(e) => {
                            e.preventDefault()
                            handleSubmit()
                        }}
                    >
                        <input
                            id="page"
                            type="text"
                            value={value}
                            disabled={disabled}
                            onBlur={handleSubmit}
                            onChange={(e) => handleChangeValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.currentTarget.blur()
                                }
                            }}
                            className={styles.pageSelectInput}
                        />
                        <input type="submit" hidden />
                        <span className={styles.pageSelectSpan} color="#4b5563">
                            of{' '}
                            <span title={`${count} total results`}>
                                {pageCount}
                            </span>
                        </span>
                    </form>
                    <PaginationArrow
                        onClick={() => onChange(page + 1)}
                        icon={FiChevronRight}
                        title="Next"
                        enabled={canNavigate && page < maxPage}
                    />
                    <PaginationArrow
                        onClick={() => onChange(maxPage)}
                        icon={FiChevronsRight}
                        title="Last"
                        enabled={canNavigate && page < maxPage}
                    />
                </div>
            </div>
        </div>
    )
}
