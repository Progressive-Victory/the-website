'use client'

import styles from './page.module.css'
import { ListElement, List } from '@/app/admin/layout/List'
import {
    FormGroup,
    FormState,
    TextField,
    Form,
    DateField,
} from '@/components/common/forms'
import { dateService } from '@/services'
import { useFetch, usePaginatedSearch } from '@/util/hooks'
import { keepPreviousData, skipToken, useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
    ActBlueDonationPacket,
    zActBlueDonationPacket,
} from 'pv-contracts/data'
import { useState } from 'react'

export default function Page() {
    const { ready, onGet } = useFetch()
    const navParams = useSearchParams()
    const navVal = navParams.get('lineitemId')

    const [selectedLineitemId, setSelectedLineitemId] = useState<number | null>(
        navVal ? +navVal : null
    )
    const [formState, setFormState] =
        useState<FormState<ActBlueDonationPacket> | null>(null)

    const {
        query: searchQuery,
        search,
        onSearch,
    } = usePaginatedSearch<ActBlueDonationPacket>(
        '/actblue/contributions',
        zActBlueDonationPacket
    )

    const contributionQuery = useQuery({
        queryKey: [`/actblue/contributions/${selectedLineitemId}`],
        queryFn:
            ready && selectedLineitemId != null
                ? async () =>
                      onGet<ActBlueDonationPacket>(
                          `/actblue/contributions/${selectedLineitemId}`,
                          zActBlueDonationPacket
                      )
                : skipToken,
        placeholderData: keepPreviousData,
    })

    const format = (value: Date, format?: Intl.DateTimeFormatOptions) => {
        if (!dateService.isValid(value)) return undefined
        return Intl.DateTimeFormat(
            'en-US',
            format ?? {
                dateStyle: 'long',
                timeStyle: 'medium',
            }
        ).format(value)
    }

    const handleSelectItem = (value: ActBlueDonationPacket) => {
        if (value.lineitemId === selectedLineitemId) return

        if (formState?.dirty) {
            const proceed = confirm(
                'You have unsaved changes! Selecting a new list element will discard them.'
            )
            if (!proceed) return
        }

        setSelectedLineitemId(value.lineitemId)
    }

    const makeTitle = (donation: ActBlueDonationPacket) => {
        return `${donation.firstName} ${donation.lastName}`
    }

    const renderItem = (item: ActBlueDonationPacket) => {
        return (
            <ListElement
                key={item.lineitemId}
                selected={selectedLineitemId == item.lineitemId}
                onClick={() => handleSelectItem(item)}
            >
                <div className={styles.userMeta}>
                    <span className={styles.username}>{makeTitle(item)}</span>
                    <span className={styles.userUsername}>
                        {format(item.paidAt)}
                    </span>
                </div>
            </ListElement>
        )
    }

    return (
        <>
            <List
                backHref="/admin/panels/fundraising"
                backLabel="Fundraising"
                search={search}
                count={searchQuery.data?.count}
                isPending={searchQuery.isPending}
                error={searchQuery.error}
                searchFields={[
                    { label: 'State', value: 'state' },
                    { label: 'Email', value: 'email' },
                    { label: 'First Name', value: 'first_name' },
                    { label: 'Last Name', value: 'last_name' },
                    { label: 'Order Number', value: 'order_number' },
                    { label: 'Lineitem Id', value: 'lineitem_id' },
                    { label: 'Paid At', value: 'paid_at' },
                ]}
                sortFields={[
                    { label: 'First Name', value: 'first_name' },
                    { label: 'Last Name', value: 'last_name' },
                    { label: 'Paid At', value: 'paid_at' },
                ]}
                onSearch={onSearch}
            >
                {searchQuery.data?.data?.map((item) => renderItem(item))}
            </List>

            <div className={styles.detailsPane}>
                {selectedLineitemId == null && (
                    <div className={styles.emptyState}>
                        No Contribution Selected
                    </div>
                )}
                {selectedLineitemId && contributionQuery.data && (
                    <Form<ActBlueDonationPacket>
                        key={selectedLineitemId}
                        form={contributionQuery.data}
                        title={`${makeTitle(contributionQuery.data)}`}
                        readonly={true}
                        saving={false}
                        isInvalid={false}
                        onUpdate={setFormState}
                        onSave={() => {
                            return
                        }}
                    >
                        <FormGroup title="Lineitem Info">
                            <TextField label="Lineitem Id" field="lineitemId" />
                            <TextField label="Sequence" field="sequence" />
                            <DateField label="Paid At" field="paidAt" />
                            <TextField label="Amount" field="amount" />
                            <TextField
                                label="Recurring Amount"
                                field="recurringAmount"
                            />
                            <TextField
                                label="Amount Minus Ab Fees"
                                field="amountLessAbFees"
                            />
                        </FormGroup>
                        <FormGroup title="Contribution Info">
                            <TextField
                                label="Order Number"
                                field="orderNumber"
                            />
                            <TextField label="Is Paypal" field="isPaypal" />
                            <TextField label="Is Mobile" field="isMobile" />
                            <TextField label="Is Express" field="Is Express" />
                            <TextField
                                label="Is Recurring"
                                field="isRecurring"
                            />
                            <TextField
                                label="Recurring Period"
                                field="recurringPeriod"
                            />
                            <TextField
                                label="Recurring Duration"
                                field="recurringDuration"
                            />
                        </FormGroup>
                        <FormGroup title="Donor Info">
                            <TextField label="First Name" field="firstName" />
                            <TextField label="Last Name" field="lastName" />
                            <TextField label="State" field="state" />
                            <TextField label="Email" field="email" />
                            <br />
                            <Link
                                href={{
                                    pathname: '/admin/panels/donors',
                                    query: {
                                        email: contributionQuery.data.email,
                                    },
                                }}
                            >
                                Full Details
                            </Link>
                        </FormGroup>
                        <FormGroup title="Contribution Form">
                            <TextField
                                label="Form Name"
                                field="contributionForm"
                            />
                            <TextField label="Form Kind" field="kind" />
                            {contributionQuery.data?.customFields?.map(
                                (field) => (
                                    <TextField
                                        key={field.label}
                                        label={field.label}
                                        getter={() => field.answer}
                                    />
                                )
                            )}
                        </FormGroup>
                    </Form>
                )}
            </div>
        </>
    )
}
