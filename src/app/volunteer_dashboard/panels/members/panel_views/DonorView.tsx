'use client'

import styles from './DonorView.module.css'
import { SearchModal } from '@/app/volunteer_dashboard/layout/SearchModal'
import { donorDetailLists } from '@/app/volunteer_dashboard/panels/donors/donorDetails'
import {
    ButtonToggleRow,
    List,
    ListBreak,
    useListEditing,
} from '@/components/common'
import { Form } from '@/components/common/forms'
import { cn } from '@/util'
import type { UseQueryResult } from '@tanstack/react-query'
import { ActBlueDonor, User } from 'pv-contracts/data'
import type { SearchRequest } from 'pv-contracts/requests'
import type { PaginatedResponse } from 'pv-contracts/responses'
import React, { ChangeEvent, useState } from 'react'
import { FiRefreshCw } from 'react-icons/fi'

export interface DonorViewProps {
    selectedId: number
    user: User

    pickingDonor: boolean
    setPickingDonor: (next: boolean) => void

    isRefetching: boolean
    linking?: boolean

    donorSearch: SearchRequest
    donorSearchQuery: UseQueryResult<PaginatedResponse<ActBlueDonor>, Error>
    onDonorSearch: (req: SearchRequest) => void

    renderDonorItem: (item: ActBlueDonor, userId: number) => React.ReactNode
    handleDeleteDonorItem: (value: ActBlueDonor, userId: number) => void
}

function RemoveMatchRow({
    refreshing,
    onRemove,
}: {
    refreshing: boolean
    onRemove: () => void
}) {
    const editing = useListEditing()
    const [removing, setRemoving] = useState(false)
    if (!editing) return null

    return (
        <ButtonToggleRow
            label={
                <>
                    ActBlue Donor
                    {refreshing && (
                        <FiRefreshCw
                            className={styles.refreshing}
                            aria-label="Refreshing"
                        />
                    )}
                </>
            }
            value
            disableLabel={
                <>
                    Remove Match
                    {removing && (
                        <FiRefreshCw
                            className={styles.refreshing}
                            aria-label="Removing"
                        />
                    )}
                </>
            }
            onValueChange={() => {
                if (removing) return
                setRemoving(true)
                onRemove()
            }}
        />
    )
}

export function DonorView({
    selectedId,
    user,
    pickingDonor,
    setPickingDonor,
    isRefetching,
    linking = false,
    donorSearch,
    donorSearchQuery,
    onDonorSearch,
    renderDonorItem,
    handleDeleteDonorItem,
}: DonorViewProps) {
    const linkedDonors = user.donors ?? []
    const hasLinked = linkedDonors.length > 0

    const openPicker = () => setPickingDonor(true)
    const closePicker = () => setPickingDonor(false)

    const queryValue = donorSearch.query ?? ''

    const handleOverlaySearch = (e: ChangeEvent<HTMLInputElement>) => {
        onDonorSearch({ ...donorSearch, query: e.target.value })
    }

    const renderPickerResults = () => {
        const { isPending, error, data } = donorSearchQuery
        const results = data?.data ?? []

        const renderContent = () => {
            if (isPending) return 'Loading...'
            if (error) return `Error: ${error.message}`
            if (results.length === 0) return 'No results found'
            return results.map((donor) => renderDonorItem(donor, selectedId))
        }

        return (
            <div className={cn(styles.pickerStatus, error && styles.error)}>
                {renderContent()}
            </div>
        )
    }

    const renderEmptyState = () => (
        <List
            title="Donor Details"
            collapsible={false}
            disclaimer="Automatic donor matching not implemented yet."
        >
            <ButtonToggleRow
                label="ActBlue Donor"
                editing
                value={false}
                enableLabel={
                    <>
                        Search Donors
                        {(linking || isRefetching) && (
                            <FiRefreshCw
                                className={styles.refreshing}
                                aria-label="Linking"
                            />
                        )}
                    </>
                }
                onValueChange={openPicker}
            />
        </List>
    )

    const renderDonorCard = (donor: ActBlueDonor) => (
        <Form<ActBlueDonor>
            key={donor.email}
            form={donor}
            title="Donor Information"
        >
            {donorDetailLists(donor, {
                showDonorLink: true,
                statsRows: [
                    <ListBreak key="remove-match-break" editingOnly />,
                    <RemoveMatchRow
                        key="remove-match"
                        refreshing={isRefetching}
                        onRemove={() =>
                            handleDeleteDonorItem(donor, selectedId)
                        }
                    />,
                ],
            })}
        </Form>
    )

    return (
        <div className={styles.root}>
            {!hasLinked && renderEmptyState()}
            {linkedDonors.map(renderDonorCard)}

            <SearchModal
                open={pickingDonor}
                onClose={closePicker}
                title="Link Donors"
                subtitle="Search ActBlue donors and link one to this user."
                searchValue={queryValue}
                onSearchChange={handleOverlaySearch}
            >
                {renderPickerResults()}
            </SearchModal>
        </div>
    )
}
