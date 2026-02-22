'use client'

import styles from './DonorView.module.css'
import { ListBody } from '@/app/admin/layout/List'
import { Form, FormGroup, TextField } from '@/components/common/forms'
import { ActBlueDonor, User } from '@/contracts/data'
import type { SearchRequest } from '@/contracts/requests'
import type { PaginatedResponse } from '@/contracts/responses'
import type { FetchError } from '@/util/hooks'
import type { UseQueryResult } from '@tanstack/react-query'
import cx from 'classnames'
import { motion } from 'motion/react'
import React, { ChangeEvent, useEffect, useMemo, useState } from 'react'

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
    const linkedDonors = user.donors ?? []
    const hasLinked = linkedDonors.length > 0

    const openPicker = () => setPickingDonor(true)
    const closePicker = () => setPickingDonor(false)

    const unlinkAll = () => {
        for (const donor of linkedDonors) {
            handleDeleteDonorItem(donor, selectedId)
        }
    }

    const queryValue = useMemo(
        () => donorSearch.query ?? '',
        [donorSearch.query]
    )

    const handleOverlaySearch = (e: ChangeEvent<HTMLInputElement>) => {
        onDonorSearch({ ...donorSearch, query: e.target.value })
    }

    const [overlayMounted, setOverlayMounted] = useState(false)
    const [overlayOpen, setOverlayOpen] = useState(false)

    useEffect(() => {
        if (pickingDonor) {
            setOverlayMounted(true)
            requestAnimationFrame(() => setOverlayOpen(true))
        } else if (overlayMounted) {
            setOverlayOpen(false)
        }
    }, [pickingDonor, overlayMounted])

    const backdropVariants = {
        open: {
            opacity: 1,
            backdropFilter: 'blur(10px) saturate(140%)',
        },
        closed: {
            opacity: 0,
            backdropFilter: 'blur(0px) saturate(140%)',
        },
    } as const

    const modalVariants = {
        open: {
            opacity: 1,
            y: 0,
            scale: 1,
        },
        closed: {
            opacity: 0,
            y: 10,
            scale: 0.985,
        },
    } as const

    const backdropTransition = {
        duration: 0.22,
        ease: [0.2, 0.9, 0.2, 1],
    } as const

    const modalTransition = {
        duration: 0.26,
        ease: [0.22, 1, 0.36, 1],
    } as const

    return (
        <div className={styles.root}>
            {!hasLinked && (
                <div className={styles.emptyStage}>
                    <div className={styles.emptyCard}>
                        <div className={styles.emptyCardHeader}>
                            <div className={styles.emptyTitle}>
                                No Donors Found
                            </div>
                            <div className={styles.emptySubtitle}>
                                Automatic donor matching not implemented yet.
                            </div>
                        </div>

                        <div className={styles.emptyActions}>
                            <button
                                type="button"
                                className={styles.ghostButton}
                                onClick={openPicker}
                            >
                                Search Donors
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {hasLinked && (
                <div className={styles.linkedStage}>
                    <div className={styles.linkedHeader}>
                        <div className={styles.linkedHeaderLeft}>
                            <div className={styles.linkedTitle}>
                                Donor Details
                            </div>
                            <div className={styles.linkedSubtitle}>
                                View donor information sourced from ActBlue
                                contributions.
                            </div>
                        </div>

                        <div className={styles.linkedHeaderRight}>
                            {isRefetching ? (
                                <span className={styles.refetchingPill}>
                                    Loading...
                                </span>
                            ) : null}

                            <button
                                type="button"
                                className={styles.ghostDangerButton}
                                onClick={unlinkAll}
                            >
                                Remove Match
                            </button>
                        </div>
                    </div>

                    <div className={styles.linkedList}>
                        {linkedDonors.map((donor) => (
                            <div key={donor.email} className={styles.donorCard}>
                                <div className={styles.donorCardTop}>
                                    <div className={styles.donorCardTitle}>
                                        {donor.firstname} {donor.lastname}
                                    </div>
                                </div>

                                <Form<ActBlueDonor>
                                    title=""
                                    readonly
                                    form={donor}
                                    onSave={() => {
                                        return
                                    }}
                                >
                                    <FormGroup
                                        title=""
                                        wrapper
                                        defaultCollapsed={false}
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
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {overlayMounted ? (
                <motion.div
                    className={styles.modalBackdrop}
                    role="presentation"
                    initial="closed"
                    animate={overlayOpen ? 'open' : 'closed'}
                    variants={backdropVariants}
                    transition={backdropTransition}
                    onAnimationComplete={() => {
                        if (!overlayOpen) setOverlayMounted(false)
                    }}
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) closePicker()
                    }}
                >
                    <motion.div
                        className={styles.modal}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Link donor"
                        initial="closed"
                        animate={overlayOpen ? 'open' : 'closed'}
                        variants={modalVariants}
                        transition={modalTransition}
                    >
                        <div className={styles.modalHeader}>
                            <div className={styles.modalHeaderLeft}>
                                <div className={styles.modalTitle}>
                                    Link Donors
                                </div>
                                <div className={styles.modalSubtitle}>
                                    Search ActBlue donors and link one to this
                                    user.
                                </div>
                            </div>

                            <div className={styles.modalHeaderRight}>
                                <div className={styles.modalSearch}>
                                    <div className={styles.searchInputBare}>
                                        <input
                                            type="text"
                                            name="donorSearch"
                                            id="donorSearch"
                                            placeholder="Search..."
                                            value={queryValue}
                                            onChange={handleOverlaySearch}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.modalBody}>
                            <ListBody
                                count={donorSearchQuery.data?.count}
                                isPending={donorSearchQuery.isPending}
                                error={donorSearchQuery.error}
                            >
                                {donorSearchQuery.data?.data.map((donor) =>
                                    renderDonorItem(donor, selectedId)
                                )}
                            </ListBody>
                        </div>

                        <div className={styles.modalFooter}>
                            <button
                                type="button"
                                className={cx(
                                    styles.ghostButton,
                                    styles.modalFooterButton
                                )}
                                onClick={closePicker}
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            ) : null}
        </div>
    )
}
