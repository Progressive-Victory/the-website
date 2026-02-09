'use client'

import styles from './page.module.css'
import { ListElement, PaginatedList } from '@/components/admin/PaginatedList'
import {
    FormState,
    Form,
    TextField,
    FormGroup,
    SelectManyField,
} from '@/components/form'
import {
    ActBlueDonor,
    zActBlueDonor,
    ActBlueContribution,
} from '@/contracts/data'
import { useFetch, usePaginatedSearch } from '@/util/hooks'
import {
    keepPreviousData,
    skipToken,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query'
import { useState } from 'react'

//import styles from './page.'

export default function Page() {
    const queryClient = useQueryClient()
    const { ready, onGet, onPatch } = useFetch()

    const [selectedEmail, setSelectedEmail] = useState<string | null>(null)
    const [formState, setFormState] = useState<FormState<ActBlueDonor> | null>(
        null
    )

    const {
        query: searchQuery,
        search,
        onSearch,
    } = usePaginatedSearch<ActBlueDonor>('/actblue/donors', zActBlueDonor)

    const donorQuery = useQuery({
        queryKey: [`/actblue/donors/${selectedEmail}`],
        queryFn:
            ready && selectedEmail != null
                ? async () => {
                      const res = await onGet<ActBlueDonor>(
                          `/actblue/donors/${selectedEmail}`,
                          zActBlueDonor
                      )
                      console.log(res)
                      return res
                  }
                : skipToken,
        placeholderData: keepPreviousData,
    })

    const handleSelectItem = (value: ActBlueDonor) => {
        if (value?.email === selectedEmail) return

        if (formState?.dirty) {
            const proceed = confirm(
                'You have unsaved changes! Selecting a new list element will discard them.'
            )
            if (!proceed) return
        }

        setSelectedEmail(value.email)
    }

    const makeTitle = (donor: ActBlueDonor) => {
        return donor.email
    }

    const makeFormTitle = (donor: ActBlueDonor) => {
        const name = makeTitle(donor)
        return name
    }

    const renderItem = (item: ActBlueDonor) => {
        return (
            <ListElement
                key={item.email}
                selected={selectedEmail == item.email}
                onClick={() => handleSelectItem(item)}
            >
                <div>
                    <span>{makeTitle(item)}</span>
                </div>
            </ListElement>
        )
    }

    return (
        <>
            <PaginatedList
                search={search}
                count={searchQuery.data?.count}
                isPending={searchQuery.isPending}
                error={searchQuery.error}
                fields={[{ value: 'email', label: 'Email' }]}
                onSearch={onSearch}
            >
                {searchQuery.data?.data?.map((item) => renderItem(item))}
            </PaginatedList>

            <div className={styles.detailsPane}>
                {selectedEmail == null && (
                    <div className={styles.emptyState}>No user selected</div>
                )}
                {selectedEmail && donorQuery.data && (
                    <Form<ActBlueDonor>
                        key={selectedEmail}
                        form={donorQuery.data}
                        title={makeFormTitle(donorQuery.data)}
                        readonly={false}
                        saving={false}
                        isInvalid={false}
                        onUpdate={() => {
                            return
                        }}
                        onSave={() => {
                            return
                        }}
                    >
                        <FormGroup title="Contact Info">
                            <TextField
                                label="First Name"
                                field="firstname"
                                required
                            />
                            <TextField
                                label="Last Name"
                                field="lastname"
                                required
                            />
                            <TextField label="Email" field="email" readonly />
                            <TextField label="Phone Number" field="phone" />
                        </FormGroup>
                        <FormGroup title="Address">
                            <TextField label="Street Address" field="addr1" />
                            <TextField label="City" field="city" />
                            <TextField label="State" field="state" />
                            <TextField label="Zip Code" field="zip" />
                            <TextField label="Country" field="country" />
                        </FormGroup>
                        <FormGroup title="Employer Info">
                            <TextField<ActBlueDonor>
                                label="Employer Name"
                                getter={(form) => form.employerData?.employer}
                            />
                            <TextField<ActBlueDonor>
                                label="Occupation"
                                getter={(form) => form.employerData?.occupation}
                            />
                            <TextField<ActBlueDonor>
                                label="Employer Street Address"
                                getter={(form) =>
                                    form.employerData?.employerAddr1
                                }
                            />
                            <TextField<ActBlueDonor>
                                label="Employer City"
                                getter={(form) =>
                                    form.employerData?.employerCity
                                }
                            />
                            <TextField<ActBlueDonor>
                                label="Employer State"
                                getter={(form) =>
                                    form.employerData?.employerState
                                }
                            />
                            <TextField<ActBlueDonor>
                                label="Employer Zip Code"
                                getter={(form) =>
                                    `${form.employerData?.employerZip ?? ''}`
                                }
                            />
                            <TextField<ActBlueDonor>
                                label="Employer Country"
                                getter={(form) =>
                                    form.employerData?.employerCountry
                                }
                            />
                        </FormGroup>
                        <>
                            {donorQuery.data.contributions ? (
                                donorQuery.data.contributions.map(
                                    (contribution) => (
                                        <FormGroup
                                            title={contribution.orderNumber}
                                            key={contribution.orderNumber}
                                        >
                                            <TextField<ActBlueDonor>
                                                label="Order Number"
                                                getter={(form) =>
                                                    contribution.orderNumber
                                                }
                                            />
                                        </FormGroup>
                                    )
                                )
                            ) : (
                                <div>None</div>
                            )}
                        </>
                    </Form>
                )}
            </div>
        </>
    )
}
