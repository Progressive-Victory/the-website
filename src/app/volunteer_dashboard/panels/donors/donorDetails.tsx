import styles from './donorDetails.module.css'
import {
    AddressRow,
    List,
    ListBreak,
    ListRow,
    NameRow,
    NavigationRow,
    PhoneRow,
} from '@/components/common'
import type { ActBlueDonor, ActBlueLineitem } from 'pv-contracts/data'
import type { ReactNode } from 'react'

const dollarFormat = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
})

const formatDollars = (amount: number) => dollarFormat.format(amount)

const formatContributionDateTime = (date: Date) =>
    Number.isNaN(date.getTime())
        ? 'Unknown date'
        : new Intl.DateTimeFormat('en-US', {
              dateStyle: 'medium',
              timeStyle: 'short',
          }).format(date)

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

const calcContributionData = (donor: ActBlueDonor) => {
    const lineitems: ActBlueLineitem[] = []
    const recurringByLineitemId = new Map<number, boolean>()
    let hasActiveRecurring = false
    let total = 0

    for (const contribution of donor.contributions ?? []) {
        if (
            contribution.isRecurring &&
            ((contribution.recurringDuration ?? 1) < 0 ||
                calcFutureDate(
                    contribution.createdAt,
                    contribution.recurringPeriod as 'weekly' | 'monthly',
                    contribution.recurringDuration ?? 1
                ) > new Date())
        )
            hasActiveRecurring = true

        for (const lineitem of contribution.lineitems ?? []) {
            total += lineitem.amount
            lineitems.push(lineitem)
            recurringByLineitemId.set(
                lineitem.lineitemId,
                contribution.isRecurring
            )
        }
    }

    return { total, hasActiveRecurring, lineitems, recurringByLineitemId }
}

export interface DonorDetailOptions {
    showDonorLink?: boolean
    statsRows?: ReactNode[]
}

// Returns the lists as an array so a parent Form can hydrate each one directly.
export function donorDetailLists(
    donor: ActBlueDonor,
    { showDonorLink = false, statsRows = [] }: DonorDetailOptions = {}
) {
    const { total, hasActiveRecurring, lineitems, recurringByLineitemId } =
        calcContributionData(donor)
    const employer = donor.employerData

    return [
        <List key="stats" title="All Time Stats">
            <ListRow label="Total Donated" value={formatDollars(total)} />
            <ListRow label="Total Contributions" value={lineitems.length} />
            <ListRow
                label="Has Active Recurring"
                value={hasActiveRecurring ? 'Yes' : 'No'}
            />
            {showDonorLink && [
                <ListBreak key="donor-link-break" />,
                <NavigationRow
                    key="donor-link"
                    label="Open in Donors Panel"
                    href={`/volunteer_dashboard/panels/donors?email=${donor.email}`}
                />,
            ]}
            {statsRows}
        </List>,

        <List key="contact" title="Contact Info">
            <NameRow
                label="Name"
                readOnly
                value={{ firstName: donor.firstname, lastName: donor.lastname }}
            />
            <ListBreak />
            <ListRow label="Email" value={donor.email} />
            <PhoneRow label="Phone" readOnly value={donor.phone} />
            <ListBreak />
            <AddressRow
                label="Address"
                readOnly
                showCountry
                value={{
                    addressLine1: donor.addr1,
                    city: donor.city,
                    state: donor.state,
                    zip: donor.zip,
                    country: donor.country,
                }}
            />
        </List>,

        <List key="employer" title="Employer Info" defaultCollapsed>
            <ListRow label="Employer" value={employer?.employer} />
            <ListRow label="Occupation" value={employer?.occupation} />
            <ListBreak />
            <AddressRow
                label="Address"
                readOnly
                showCountry
                value={{
                    addressLine1: employer?.employerAddr1,
                    city: employer?.employerCity,
                    state: employer?.employerState,
                    zip: employer?.employerZip,
                    country: employer?.employerCountry,
                }}
            />
        </List>,

        <List key="contributions" title="Contributions">
            {lineitems.length === 0 ? (
                <ListRow label="No contributions" muted />
            ) : (
                lineitems
                    .toSorted((a, b) => b.paidAt.getTime() - a.paidAt.getTime())
                    .map((lineitem) => {
                        const recurring = recurringByLineitemId.get(
                            lineitem.lineitemId
                        )
                        return (
                            <NavigationRow
                                key={lineitem.lineitemId}
                                label={`Donated ${formatDollars(lineitem.amount)}`}
                                sublabel={formatContributionDateTime(
                                    lineitem.paidAt
                                )}
                                value={
                                    <span
                                        className={styles.typeTag}
                                        data-recurring={!!recurring}
                                    >
                                        {recurring ? 'Recurring' : 'One Time'}
                                    </span>
                                }
                                href={`/volunteer_dashboard/panels/contributions?lineitemId=${lineitem.lineitemId}`}
                            />
                        )
                    })
            )}
        </List>,
    ]
}
