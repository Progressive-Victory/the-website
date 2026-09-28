import {
    addressFields,
    AddressDraft,
    AddressField,
    ContributionRecord,
    DescribeChange,
    Member,
    MemberEdits,
    MembershipTier,
    membershipTiers,
    MembershipSearchField,
    PendingUpdate,
    RecurringSummary,
    TierSegment,
} from './membership.types'
import { toDeliverableStatus, toPackageShipped } from '@/util'
import { ShirtSize, UserAddress } from 'pv-contracts/data'
import {
    UpdateMembershipRequest,
    UpdateUserAddressRequest,
    UpdateUserRequest,
} from 'pv-contracts/requests'
import { MembershipsResponsePacket } from 'pv-contracts/responses'

export const joinName = (firstName?: string | null, lastName?: string | null) =>
    [firstName, lastName].filter(Boolean).join(' ').trim() || undefined

export const formatUserAddress = (address?: UserAddress) =>
    [
        [address?.addressLine1, address?.addressLine2]
            .filter(Boolean)
            .join(', '),
        [
            address?.city,
            [address?.state, address?.zip].filter(Boolean).join(' '),
        ]
            .filter(Boolean)
            .join(', '),
    ]
        .filter(Boolean)
        .join(', ') || undefined

export const normalizePhone = (phone: string) => phone.replace(/\D/g, '')

export const phoneKey = (phone: string) =>
    normalizePhone(phone).replace(/^1(?=\d{10}$)/, '')

export const formatPhone = (phone?: string) => {
    if (!phone) return '—'
    const digits = phoneKey(phone)
    if (digits.length === 10) {
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
    }
    return phone
}

export const normalizeEmail = (email: string) => email.trim().toLowerCase()

export const normalizeDiscordHandle = (handle: string) =>
    handle.trim().replace(/^@/, '')

export const discordKey = (handle: string) =>
    normalizeDiscordHandle(handle).toLowerCase()

export const nameKey = (name: string) =>
    name.trim().toLowerCase().replace(/\s+/g, ' ')

export const resolveSelectDraft = <T>(
    draft: T | null | undefined,
    saved: T | undefined
) => ({
    value: (draft === undefined ? saved : draft) ?? null,
    dirty: draft !== undefined && (draft ?? undefined) !== saved,
})

export const isValidPhone = (phone: string) => {
    const digits = normalizePhone(phone)
    return digits.length === 0 || digits.length >= 10
}

export const isValidAddressField = (field: AddressField, value: string) => {
    const trimmed = value.trim()
    if (trimmed === '') return true
    if (field === 'state') return /^[A-Za-z]{2}$/.test(trimmed)
    if (field === 'zip') return /^\d{5}$/.test(trimmed)
    return true
}

export const isValidAddressDraft = (draft: AddressDraft) =>
    addressFields.every((key) => isValidAddressField(key, draft[key] ?? ''))

export const hasNameDraftChange = (member: Member, draft: MemberEdits) =>
    (['userFirstName', 'userLastName'] as const).some((key) => {
        const value = draft[key]
        return value != null && value.trim() !== (member[key] ?? '').trim()
    })

export const hasDiscordDraftChange = (member: Member, draft: MemberEdits) =>
    draft.discordConfirmed != null &&
    draft.discordConfirmed !== (member.discordConfirmed ?? false)

export const hasAddressDraftChange = (member: Member, draft: MemberEdits) =>
    draft.address != null &&
    addressFields.some((key) => {
        const value = draft.address?.[key]
        return (
            value != null &&
            value.trim() !== (member.userAddressParts?.[key] ?? '').trim()
        )
    })

const formatDonorAddress = (
    donor: MembershipsResponsePacket['donor']
): string | undefined => {
    const country = donor.country?.trim()
    const zipDigits = donor.zip?.replace(/\D/g, '').slice(0, 5)
    const zip = zipDigits === '' ? donor.zip : zipDigits

    return (
        [
            donor.addr1,
            [donor.city, [donor.state, zip].filter(Boolean).join(' ')]
                .filter(Boolean)
                .join(', '),
            country?.toLowerCase() === 'united states' ? undefined : country,
        ]
            .filter(Boolean)
            .join(', ') || undefined
    )
}

const monthSpan = (start: Date, end: Date) =>
    (end.getUTCFullYear() - start.getUTCFullYear()) * 12 +
    (end.getUTCMonth() - start.getUTCMonth()) +
    1

const buildContributionRecords = (
    donor: MembershipsResponsePacket['donor']
): ContributionRecord[] | undefined =>
    donor.contributions?.map((contribution) => {
        const lineitems = contribution.lineitems ?? []
        const earliestPaidAt = lineitems.reduce<Date | undefined>(
            (earliest, lineitem) =>
                !earliest || lineitem.paidAt < earliest
                    ? lineitem.paidAt
                    : earliest,
            undefined
        )
        const mostRecentLineitem = lineitems.reduce<
            (typeof lineitems)[number] | undefined
        >(
            (latest, lineitem) =>
                !latest || lineitem.paidAt > latest.paidAt ? lineitem : latest,
            undefined
        )
        const mostRecentPaidAt = mostRecentLineitem?.paidAt
        const monthsWithLineitems = new Set(
            lineitems.map(
                (lineitem) =>
                    `${lineitem.paidAt.getUTCFullYear()}-${lineitem.paidAt.getUTCMonth()}`
            )
        ).size
        const lineitemMonths = [
            ...new Set(
                lineitems.map(
                    (lineitem) =>
                        `${lineitem.paidAt.getUTCFullYear()}-${lineitem.paidAt.getUTCMonth()}`
                )
            ),
        ]
        const lineitemCountsByMonth = lineitems.reduce<Record<string, number>>(
            (counts, lineitem) => {
                const key = `${lineitem.paidAt.getUTCFullYear()}-${lineitem.paidAt.getUTCMonth()}`
                counts[key] = (counts[key] ?? 0) + 1
                return counts
            },
            {}
        )
        const lineitemsByMonth = lineitems.reduce<
            Record<
                string,
                { paidAt: string; amount: number; orderNumber: string }[]
            >
        >((byMonth, lineitem) => {
            const key = `${lineitem.paidAt.getUTCFullYear()}-${lineitem.paidAt.getUTCMonth()}`
            byMonth[key] = [
                ...(byMonth[key] ?? []),
                {
                    paidAt: lineitem.paidAt.toISOString(),
                    amount: lineitem.amount,
                    orderNumber: contribution.orderNumber,
                },
            ]
            return byMonth
        }, {})
        const recurringAmount = lineitems.find(
            (lineitem) => lineitem.recurringAmount != null
        )?.recurringAmount
        const firstLineitemId = lineitems.find(
            (lineitem) => lineitem.sequence === 0
        )?.lineitemId

        return {
            orderNumber: contribution.orderNumber,
            createdAt: contribution.createdAt.toISOString(),
            amount: lineitems.reduce(
                (sum, lineitem) => sum + lineitem.amount,
                0
            ),
            contributionForm: contribution.contributionForm,
            lineitemCount: lineitems.length,
            isRecurring: contribution.isRecurring,
            recurringAmount: recurringAmount ?? undefined,
            firstLineitemId,
            mostRecentLineitemDate: mostRecentPaidAt?.toISOString(),
            mostRecentLineitemAmount: mostRecentLineitem?.amount,
            earliestLineitemDate: earliestPaidAt?.toISOString(),
            monthsWithLineitems,
            lineitemMonths,
            lineitemCountsByMonth,
            lineitemsByMonth,
            monthsSpanned:
                earliestPaidAt && mostRecentPaidAt
                    ? monthSpan(earliestPaidAt, mostRecentPaidAt)
                    : undefined,
        }
    })

export const filterRecurringContributions = (
    records: ContributionRecord[] | undefined
) => (records ?? []).filter((record) => record.isRecurring)

export const memberSearchValues = (
    member: Member,
    field: MembershipSearchField
): (string | undefined)[] => {
    if (field === 'discord')
        return [member.discordUsername, member.contributionDiscord]
    if (field === 'email')
        return [member.userEmail, member.discordEmail, member.donorEmail]
    return [member.userName, member.donorName]
}

export const matchesSearchQuery = (
    member: Member,
    normalizedQuery: string,
    field: MembershipSearchField
) =>
    normalizedQuery !== '' &&
    memberSearchValues(member, field).some((value) =>
        value?.toLowerCase().includes(normalizedQuery)
    )

export const countMonthsWithLineitems = (records: ContributionRecord[]) =>
    new Set(records.flatMap((record) => record.lineitemMonths ?? [])).size

export const getEarliestLineitemDate = (records: ContributionRecord[]) =>
    records.reduce<string | undefined>(
        (earliest, record) =>
            !earliest ||
            (record.earliestLineitemDate &&
                record.earliestLineitemDate < earliest)
                ? record.earliestLineitemDate
                : earliest,
        undefined
    )

const monthDiff = (from: Date, to: Date) =>
    (to.getUTCFullYear() - from.getUTCFullYear()) * 12 +
    (to.getUTCMonth() - from.getUTCMonth())

const tierThresholds = [
    [100, 'Inner Circle Member'],
    [20, 'Signature Member'],
    [10, 'Premium Member'],
    [5, 'Dues Paying Member'],
] as const satisfies readonly (readonly [number, MembershipTier])[]

export const getMembershipTierForAmount = (amount?: number) => {
    if (amount == null) return undefined
    return tierThresholds.find(([min]) => amount >= min)?.[1]
}

const buildPaymentTimeline = (
    records: ContributionRecord[],
    isSameSegment: (current: TierSegment, amount: number) => boolean
): TierSegment[] => {
    const payments = records
        .flatMap((record) =>
            Object.values(record.lineitemsByMonth ?? {}).flat()
        )
        .sort((a, b) => a.paidAt.localeCompare(b.paidAt))

    const segments: TierSegment[] = []

    for (const payment of payments) {
        const current = segments.at(-1)

        if (current && isSameSegment(current, payment.amount)) {
            current.to = payment.paidAt
            current.payments += 1
            current.minAmount = Math.min(current.minAmount, payment.amount)
            current.maxAmount = Math.max(current.maxAmount, payment.amount)
            continue
        }

        segments.push({
            tier: getMembershipTierForAmount(payment.amount),
            from: payment.paidAt,
            to: payment.paidAt,
            payments: 1,
            minAmount: payment.amount,
            maxAmount: payment.amount,
        })
    }

    return segments
}

export const buildTierTimeline = (records: ContributionRecord[]) =>
    buildPaymentTimeline(
        records,
        (current, amount) => current.tier === getMembershipTierForAmount(amount)
    )

export const buildAmountTimeline = (records: ContributionRecord[]) =>
    buildPaymentTimeline(
        records,
        (current, amount) => current.minAmount === amount
    )

export const computeRecurringSummary = (
    records: ContributionRecord[],
    referenceDate: Date = new Date()
): RecurringSummary => {
    const monthKeys = new Set<string>()
    const amountCandidates: { date: string; amount: number }[] = []
    let earliestLineitemDate: string | undefined
    let lastPaidDate: string | undefined

    for (const record of records) {
        for (const key of record.lineitemMonths ?? []) monthKeys.add(key)

        if (
            record.earliestLineitemDate != null &&
            (earliestLineitemDate == null ||
                record.earliestLineitemDate < earliestLineitemDate)
        ) {
            earliestLineitemDate = record.earliestLineitemDate
        }

        if (
            record.mostRecentLineitemDate != null &&
            record.mostRecentLineitemAmount != null
        ) {
            amountCandidates.push({
                date: record.mostRecentLineitemDate,
                amount: record.mostRecentLineitemAmount,
            })
            if (
                lastPaidDate == null ||
                record.mostRecentLineitemDate > lastPaidDate
            ) {
                lastPaidDate = record.mostRecentLineitemDate
            }
        }
    }

    const activeAmountAsOf = (asOf: Date) => {
        let best: number | undefined
        for (const candidate of amountCandidates) {
            if (monthDiff(new Date(candidate.date), asOf) > 1) continue
            if (best == null || candidate.amount > best) best = candidate.amount
        }
        return best
    }

    const activeAmount =
        activeAmountAsOf(referenceDate) ??
        (lastPaidDate != null
            ? activeAmountAsOf(new Date(lastPaidDate))
            : undefined)

    return {
        monthsWithLineitems: monthKeys.size,
        earliestLineitemDate,
        activeAmount,
        totalAmount: records.reduce((sum, record) => sum + record.amount, 0),
        tier: getMembershipTierForAmount(activeAmount),
    }
}

export const mapPacketToMember = (
    packet: MembershipsResponsePacket,
    index: number
): Member => {
    const { donor, user, customField } = packet
    const membership = donor.membershipData
    const cardStatus = membership?.membershipCardStatus
    const merchStatus = membership?.membershipMerchStatus

    const contributionDiscord = customField?.answer.trim()
    const contributionRecords = buildContributionRecords(donor)
    const recurringSummary = computeRecurringSummary(
        filterRecurringContributions(contributionRecords)
    )

    return {
        packet,
        id: index + 1,
        userId: user?.id,
        firstName: donor.firstname,
        lastName: donor.lastname,
        userFirstName: user?.firstName ?? undefined,
        userLastName: user?.lastName ?? undefined,
        userName:
            joinName(user?.firstName, user?.lastName) ??
            user?.preferredName ??
            undefined,
        donorName: joinName(donor.firstname, donor.lastname),
        discordUsername: user?.discordUsers?.[0]?.username,
        contributionDiscord:
            contributionDiscord === '' ? undefined : contributionDiscord,
        phone: user?.phone ?? donor.phone ?? undefined,
        userPhone: user?.phone ?? undefined,
        donorPhone: donor.phone ?? undefined,
        email: user?.email ?? user?.discordUsers?.[0]?.email ?? donor.email,
        donorEmail: donor.email,
        userEmail: user?.email ?? undefined,
        discordEmail: user?.discordUsers?.[0]?.email ?? undefined,
        address1: donor.addr1 ?? undefined,
        city: donor.city ?? undefined,
        state: donor.state ?? undefined,
        zip: donor.zip ?? undefined,
        country: donor.country ?? undefined,
        userAddress: formatUserAddress(user?.address),
        userAddressParts: user?.address,
        donorAddress: formatDonorAddress(donor),
        shirtSize: membership?.shirtSize ?? undefined,
        isMember: membership?.duesPayingMember,
        eligibleForBenefits: membership?.membershipBenefitEligible,
        membershipTier: membershipTiers.find(
            (tier) => tier === customField?.label
        ),
        beganMembership: donor.contributions?.[0]?.createdAt
            ?.toISOString()
            .slice(0, 10),
        numberOfContributions: donor.contributions?.length,
        contributionRecords,
        recurringSummary,
        discordConfirmed:
            membership?.discordConfirmed ?? Boolean(user?.discordUsers?.length),
        nameConfirmed:
            membership?.nameConfirmed ?? user?.nameConfirmed ?? false,
        addressConfirmed:
            membership?.addressConfirmed ?? user?.addressConfirmed ?? false,
        cardPrinted: membership?.cardPrinted ?? false,
        labelPrinted: membership?.labelPrinted ?? false,
        cardPacked: membership?.itemsPackaged ?? false,
        benefitShipped: membership?.benefitsShipped ?? false,
        membershipCardStatus: cardStatus,
        membershipMerchStatus: merchStatus,
        packageShipped: toPackageShipped(cardStatus),
        userMatched: Boolean(user),
    }
}

type FieldChange<T> = T | null | undefined

const textChange = (
    draft: string | undefined,
    saved: string | null | undefined
): FieldChange<string> => {
    if (draft == null) return undefined
    const value = draft.trim()
    if (value === (saved ?? '').trim()) return undefined
    return value === '' ? null : value
}

const phoneChange = (
    draft: string | undefined,
    saved: string | null | undefined
): FieldChange<string> => {
    if (draft == null) return undefined
    const phone = normalizePhone(draft)
    if (phone === normalizePhone(saved ?? '')) return undefined
    return phone === '' ? null : phone
}

const buildAddressRequest = (member: Member, draft: AddressDraft) => {
    const request: UpdateUserAddressRequest = {}

    for (const key of addressFields) {
        const change = textChange(draft[key], member.userAddressParts?.[key])
        if (change !== undefined) request[key] = change
    }

    return Object.keys(request).length > 0 ? request : undefined
}

const resolveConfirmation = (
    draft: boolean | undefined,
    saved: boolean | undefined,
    invalidatedByEdit: boolean
) => {
    if (draft !== undefined) return draft === saved ? undefined : draft
    return invalidatedByEdit && saved !== false ? false : undefined
}

const resolveShirtSize = (
    member: Member,
    draft: MemberEdits
): FieldChange<ShirtSize> => {
    if (draft.shirtSize === undefined) return undefined
    if ((draft.shirtSize ?? undefined) === member.shirtSize) return undefined
    return draft.shirtSize ?? null
}

const resolveCardStatus = (member: Member, draft: MemberEdits) => {
    if (draft.packageShipped !== undefined) {
        if ((draft.packageShipped ?? undefined) === member.packageShipped)
            return undefined
        return draft.packageShipped == null
            ? undefined
            : toDeliverableStatus(draft.packageShipped)
    }

    return undefined
}

const buildUserRequest = (member: Member, draft: MemberEdits) => {
    const request: UpdateUserRequest = {}

    const email = textChange(draft.userEmail, member.userEmail)
    if (email !== undefined) request.email = email

    const firstName = textChange(draft.userFirstName, member.userFirstName)
    if (firstName !== undefined) request.firstName = firstName

    const lastName = textChange(draft.userLastName, member.userLastName)
    if (lastName !== undefined) request.lastName = lastName

    const phone = phoneChange(draft.userPhone, member.userPhone)
    if (phone !== undefined) request.phone = phone

    const address = draft.address && buildAddressRequest(member, draft.address)
    if (address) request.address = address

    return request
}

const buildMembershipRequest = (member: Member, draft: MemberEdits) => {
    const request: UpdateMembershipRequest = {}

    const shirtSize = resolveShirtSize(member, draft)
    if (shirtSize !== undefined) request.shirtSize = shirtSize

    const nameConfirmed = resolveConfirmation(
        draft.nameConfirmed,
        member.nameConfirmed,
        hasNameDraftChange(member, draft)
    )
    if (nameConfirmed !== undefined) request.nameConfirmed = nameConfirmed

    const discordConfirmed = resolveConfirmation(
        draft.discordConfirmed,
        member.discordConfirmed,
        hasDiscordDraftChange(member, draft)
    )
    if (discordConfirmed !== undefined)
        request.discordConfirmed = discordConfirmed

    const addressConfirmed = resolveConfirmation(
        draft.addressConfirmed,
        member.addressConfirmed,
        hasAddressDraftChange(member, draft)
    )
    if (addressConfirmed !== undefined)
        request.addressConfirmed = addressConfirmed

    const cardStatus = resolveCardStatus(member, draft)
    if (cardStatus !== undefined) request.membershipCardStatus = cardStatus

    if (
        draft.cardPrinted !== undefined &&
        draft.cardPrinted !== member.cardPrinted
    ) {
        request.cardPrinted = draft.cardPrinted
    }

    if (
        draft.labelPrinted !== undefined &&
        draft.labelPrinted !== member.labelPrinted
    ) {
        request.labelPrinted = draft.labelPrinted
    }

    if (
        draft.cardPacked !== undefined &&
        draft.cardPacked !== member.cardPacked
    ) {
        request.itemsPackaged = draft.cardPacked
    }

    if (
        draft.benefitShipped !== undefined &&
        draft.benefitShipped !== member.benefitShipped
    ) {
        request.benefitsShipped = draft.benefitShipped
    }

    return request
}

export const buildPendingUpdates = (
    membersByEmail: Map<string, Member>,
    edits: Record<string, MemberEdits>
): PendingUpdate[] =>
    Object.entries(edits).flatMap(([donorEmail, draft]) => {
        const member = membersByEmail.get(donorEmail)
        if (member == null) return []

        const userRequest =
            member.userId != null ? buildUserRequest(member, draft) : {}
        const membershipRequest = buildMembershipRequest(member, draft)

        const user = userRequest
        const membership = membershipRequest

        const hasUser = Object.keys(user).length > 0
        const hasMembership = Object.keys(membership).length > 0
        if (!hasUser && !hasMembership) return []

        return [
            {
                donorEmail,
                userId: member.userId,
                user: hasUser ? user : undefined,
                membership: hasMembership ? membership : undefined,
            },
        ]
    })

export const describeNameChange: DescribeChange = (update, previous) => {
    const action = previous ? 'Changed' : 'Set'
    const firstChanged =
        (update.firstName ?? '') !== (previous?.firstName ?? '')
    const lastChanged = (update.lastName ?? '') !== (previous?.lastName ?? '')

    if (!firstChanged && !lastChanged) return undefined

    if (firstChanged && !lastChanged && update.firstName)
        return { label: `First Name ${action}`, value: update.firstName }

    if (lastChanged && !firstChanged && update.lastName)
        return { label: `Last Name ${action}`, value: update.lastName }

    const value = joinName(update.firstName, update.lastName)
    return value ? { label: `Name ${action}`, value } : undefined
}

const describeSimpleChange =
    (
        field: 'phone' | 'email',
        noun: string,
        format: (value: string) => string = (value) => value
    ): DescribeChange =>
    (update, previous) => {
        const value = update[field] ?? ''
        if (value === (previous?.[field] ?? '') || value === '')
            return undefined

        return {
            label: `${noun} ${previous ? 'Changed' : 'Set'}`,
            value: format(value),
        }
    }

export const describePhoneChange = describeSimpleChange(
    'phone',
    'Phone',
    formatPhone
)

export const describeEmailChange = describeSimpleChange('email', 'Email')

export const describeAddressChange: DescribeChange = (update, previous) => {
    const value = formatUserAddress(update.address)
    if (!value || value === formatUserAddress(previous?.address))
        return undefined

    return { label: `Address ${previous ? 'Changed' : 'Set'}`, value }
}
