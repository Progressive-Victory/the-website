'use client'

import styles from '../page.module.css'
import { ListElement, List } from '@/app/admin/layout/List'
import { Form, FormGroup, TextField } from '@/components/common/forms'
import { ActBlueDonor, User } from '@/contracts/data'
import type { SearchRequest } from '@/contracts/requests'
import type { PaginatedResponse } from '@/contracts/responses'
import type { FetchError } from '@/util/hooks'
import type { UseQueryResult } from '@tanstack/react-query'

export interface DonorViewProps {
    selectedId: number
    user: User

    pickingDonor: boolean
    setPickingDonor: (next: boolean) => void

    isRefetching: boolean

    donorSearch: SearchRequest
    donorSearchQuery: UseQueryResult<
        PaginatedResponse<ActBlueDonor>,
        FetchError
    >
    onDonorSearch: (req: SearchRequest) => void

    renderDonorItem: (item: ActBlueDonor, userId: number) => React.ReactNode
    handleDeleteDonorItem: (value: ActBlueDonor, userId: number) => void
}

export function DonorView({
    selectedId,
    user,
    pickingDonor,
    setPickingDonor,
    isRefetching,
    donorSearch,
    donorSearchQuery,
    onDonorSearch,
    renderDonorItem,
    handleDeleteDonorItem,
}: DonorViewProps) {
    return (
        <>
            <div className={styles.detailsPane}>
                <button onClick={() => setPickingDonor(!pickingDonor)}>
                    {pickingDonor ? 'Cancel' : 'Link Donor'}
                </button>

                {isRefetching ? <span>refreshing...</span> : <></>}

                {pickingDonor ? (
                    <List
                        search={donorSearch}
                        count={donorSearchQuery.data?.count}
                        isPending={donorSearchQuery.isPending}
                        error={donorSearchQuery.error}
                        onSearch={onDonorSearch}
                    >
                        {donorSearchQuery.data?.data.map((donor) =>
                            renderDonorItem(donor, selectedId)
                        )}
                    </List>
                ) : (
                    <></>
                )}
            </div>

            <div>
                {(user.donors ?? []).length > 0 ? (
                    <>
                        {user.donors?.map((donor) => (
                            <div
                                key={donor.email}
                                className={styles.detailsPane}
                            >
                                <Form<ActBlueDonor>
                                    title={`${donor.firstname} ${donor.lastname}`}
                                    readonly
                                    form={donor}
                                    onSave={() => {
                                        return
                                    }}
                                >
                                    <FormGroup
                                        title="Details"
                                        wrapper
                                        defaultCollapsed
                                    >
                                        <FormGroup
                                            title="Contact Info"
                                            subGroup
                                        >
                                            <TextField
                                                label="First Name"
                                                field="firstName"
                                            />
                                            <TextField
                                                label="Last Name"
                                                field="lastName"
                                            />
                                            <TextField
                                                label="Email"
                                                field="email"
                                            />
                                            <TextField
                                                label="Phone"
                                                field="phone"
                                            />
                                        </FormGroup>

                                        <FormGroup title="Address" subGroup>
                                            <TextField
                                                label="Street Address"
                                                field="addr1"
                                            />
                                            <TextField
                                                label="City"
                                                field="city"
                                            />
                                            <TextField
                                                label="State"
                                                field="state"
                                            />
                                            <TextField
                                                label="Zip"
                                                field="zip"
                                            />
                                            <TextField
                                                label="Country"
                                                field="country"
                                            />
                                        </FormGroup>
                                    </FormGroup>
                                </Form>

                                <button
                                    onClick={() =>
                                        void handleDeleteDonorItem(
                                            donor,
                                            selectedId
                                        )
                                    }
                                >
                                    Unlink
                                </button>
                            </div>
                        ))}
                    </>
                ) : (
                    <span>Select a Donor to Link</span>
                )}
            </div>
        </>
    )
}
