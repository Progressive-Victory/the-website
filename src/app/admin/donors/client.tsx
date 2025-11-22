'use client'

import PaginatedList from '@/components/admin/PaginatedList'
import { Form, FormGroup, SelectField, TextField } from '@/components/form'
import { IDonor } from '@/models'
import deepEqual from 'deep-equal'
import { useRef, useState } from 'react'

export interface PageProps {}

export default function ClientPage({}: PageProps) {
    const eventTarget = useRef(new EventTarget())

    const [originalDonor, setOriginalDonor] = useState<IDonor | null>(null)
    const [selectedDonor, setSelectedDonor] = useState<IDonor | null>(null)
    const [donors, setDonors] = useState<IDonor[]>([])

    const handleSelectItem = (value: IDonor) => {
        if (value._id === selectedDonor?._id) return

        if (!deepEqual(selectedDonor, originalDonor)) {
            const proceed = confirm(
                'You have unsaved changes! Selecting a new list element will discard them.'
            )
            if (!proceed) return
        }

        setSelectedDonor({ ...value } as IDonor)
        setOriginalDonor({ ...value } as IDonor)
    }

    const makeItem = (donor: IDonor) => ({
        id: donor._id as string,
        value: donor,
    })

    return (
        <>
            <PaginatedList<IDonor>
                eventTarget={eventTarget.current}
                endpoint="/api/admin/donors"
                filters={[]}
                searchFields={[
                    {
                        id: 'name',
                        name: 'Name',
                    },
                    {
                        id: 'email',
                        name: 'Email',
                    },
                    {
                        id: 'firstName',
                        name: 'First Name',
                    },
                    {
                        id: 'lastName',
                        name: 'Last Name',
                    },
                    {
                        id: 'preferredName',
                        name: 'Preferred Name',
                    },
                    {
                        id: 'state',
                        name: 'State',
                    },
                ]}
                items={donors.map(makeItem)}
                selectedItem={selectedDonor ? makeItem(selectedDonor) : null}
                onSelectItem={({ value }) => handleSelectItem(value)}
                setItems={setDonors}
                renderItem={({ value }) => (
                    <span className="font-medium text-black">
                        {`${value.firstname} ${value.lastname}`}
                    </span>
                )}
            />
            <div className="h-[calc(100vh-100px)] flex-1 overflow-y-auto">
                {selectedDonor && originalDonor ? (
                    <Form<IDonor>
                        initialValue={originalDonor}
                        setInitialValue={setOriginalDonor}
                        currentValue={selectedDonor}
                        setCurrentValue={setSelectedDonor}
                        computeTitle={(user) =>
                            `${user.firstname} ${user.lastname}`
                        }
                        patchEndpoint="/api/admin/donors"
                        onChangesSaved={() =>
                            eventTarget.current.dispatchEvent(
                                new Event('refetch')
                            )
                        }
                        updateHistory
                    >
                        <FormGroup title="Donor Information">
                            <TextField
                                name="First Name"
                                field="firstname"
                                readonly
                            />
                            <TextField
                                name="Last Name"
                                field="lastname"
                                readonly
                            />
                            <TextField name="Email" field="email" readonly />
                            <TextField
                                name="Phone Number"
                                field="phone"
                                readonly
                            />
                        </FormGroup>
                        <FormGroup title="Shipping Address">
                            <TextField
                                name="Shipping First Name"
                                field="shippingFirstName"
                                readonly
                            />
                            <TextField
                                name="Shipping Last Name"
                                field="shippingLastName"
                                readonly
                            />
                            <TextField
                                name="Address"
                                field="shippingAddr1"
                                readonly
                            />
                            <TextField
                                name="City"
                                field="shippingCity"
                                readonly
                            />
                            <TextField
                                name="State"
                                field="shipppingState"
                                readonly
                            />
                            <TextField
                                name="Zip Code"
                                field="shippingZip"
                                readonly
                            />
                        </FormGroup>
                        <FormGroup title="Order Status">
                            <TextField
                                name="Order Number"
                                field="orderNumber"
                                readonly
                            />
                            <TextField name="Status" field="status" readonly />
                            <TextField name="Amount" field="amount" readonly />
                            <TextField
                                name="Contribution Date"
                                field="contributionDate"
                                readonly
                            />
                            <TextField
                                name="Recurring Duration"
                                field="recurringDuration"
                                readonly
                            />
                            <TextField
                                name="Recurring Period"
                                field="recurringPeriod"
                                readonly
                            />
                            <SelectField
                                name="Shipping Status"
                                field="shippingStatus"
                                options={[
                                    {
                                        name: 'Not Shipped',
                                        value: 'not_shipped',
                                    },
                                    {
                                        name: 'Shipped',
                                        value: 'shipped',
                                    },
                                ]}
                                required
                            />
                        </FormGroup>
                    </Form>
                ) : (
                    <div className="flex h-full items-center justify-center">
                        No donor selected
                    </div>
                )}
            </div>
        </>
    )
}
