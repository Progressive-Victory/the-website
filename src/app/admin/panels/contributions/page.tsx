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
import { ActBlueDonationPacket, zActBlueDonationPacket } from '@/contracts/data'
import { dateService } from '@/services'
import { useFetch, usePaginatedSearch } from '@/util/hooks'
import { keepPreviousData, skipToken, useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
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

    return <></>
}
