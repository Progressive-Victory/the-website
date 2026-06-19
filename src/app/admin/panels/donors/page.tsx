'use client'

import styles from './page.module.css'
import { ListElement, List } from '@/app/admin/layout/List'
import {
    FormState,
    Form,
    TextField,
    FormGroup,
    DateField,
} from '@/components/common/forms'
import {
    ActBlueDonor,
    zActBlueDonor,
    ActBlueContribution,
    ActBlueLineitem,
    ActBlueContributionCustomField,
} from '@/contracts/data'
import { useFetch, usePaginatedSearch } from '@/util/hooks'
import { keepPreviousData, skipToken, useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useState, useMemo } from 'react'

interface contributionData {
    total: number
    hasActiveRecurring: boolean
    customFields: ActBlueContributionCustomField[]
    lineitems: ActBlueLineitem[]
}

export default function Page() {
    const { ready, onGet } = useFetch()
    const navParams = useSearchParams()
    const navEmail = navParams.get('email')

    const [selectedEmail, setSelectedEmail] = useState<string | null>(navEmail)
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
                ? async () =>
                      onGet<ActBlueDonor>(
                          `/actblue/donors/${selectedEmail}`,
                          zActBlueDonor
                      )
                : skipToken,
        placeholderData: keepPreviousData,
    })

    const calcFutureDate = (
        initialTime: Date,
        period: 'weekly' | 'monthly',
        duration: number
    ) => {
        switch (period) {
            case 'weekly':
                return new Date(
                    initialTime.getTime() +
                        new Date(duration * 7 * 24 * 60 * 60 * 1000).getTime()
                )
            case 'monthly':
                initialTime.setMonth(initialTime.getMonth())
                return initialTime
        }
    }

    const contributionData = useMemo(() => {
        const li: ActBlueLineitem[] = []
        let hasActiveRecurring = false
        let total = 0
        let customFields: ActBlueContributionCustomField[] = []
        ;(donorQuery.data?.contributions ?? []).forEach(
            (contribution: ActBlueContribution) => {
                customFields = contribution.customFields
                if (
                    contribution.isRecurring &&
                    ((contribution.recurringDuration ?? 1) < 0 ||
                        calcFutureDate(
                            contribution.createdAt,
                            contribution.recurringPeriod as
                                | 'weekly'
                                | 'monthly',
                            contribution.recurringDuration ?? 1
                        ) > new Date())
                )
                    hasActiveRecurring = true
                ;(contribution.lineitems ?? []).forEach(
                    (lineitem: ActBlueLineitem) => {
                        total += lineitem.amount
                        li.push(lineitem)
                    }
                )
            }
        )

        return {
            total,
            hasActiveRecurring,
            customFields,
            lineitems: li,
        } satisfies contributionData
    }, [donorQuery.data])

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
        return `${donor.firstname} ${donor.lastname}`
    }

    const renderItem = (item: ActBlueDonor) => {
        return (
            <ListElement
                key={item.email}
                selected={selectedEmail == item.email}
                onClick={() => handleSelectItem(item)}
            >
                <div className={styles.userName}>
                    <span>{makeTitle(item)}</span>
                </div>
            </ListElement>
        )
    }

    return <></>
}
