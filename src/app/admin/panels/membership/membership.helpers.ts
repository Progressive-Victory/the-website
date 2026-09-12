import {
    addressFields,
    AddressDraft,
    AddressField,
    DescribeChange,
    Member,
    MemberEdits,
    membershipTiers,
    PackageShipped,
    PendingUpdate,
    ShirtSize,
} from './membership.types'
import {
    MembershipDeliverableStatus,
    ShirtSize as ApiShirtSize,
    UserAddress,
} from '@/contracts/data'
import {
    UpdateMembershipRequest,
    UpdateUserAddressRequest,
    UpdateUserRequest,
} from '@/contracts/requests'
import { MembershipsResponsePacket } from '@/contracts/responses'

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

export const formatPhone = (phone?: string) => {
    if (!phone) return '—'
    const digits = normalizePhone(phone).replace(/^1(?=\d{10}$)/, '')
    if (digits.length === 10) {
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
    }
    return phone
}

export const normalizeEmail = (email: string) => email.trim().toLowerCase()

export const normalizeDiscordHandle = (handle: string) =>
    handle.trim().replace(/^@/, '')

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

const packageShippedFromStatus = (
    merchStatus?: MembershipDeliverableStatus
): PackageShipped | undefined => {
    if (merchStatus == null) return undefined
    if (merchStatus === MembershipDeliverableStatus.Returned) return 'Returned'
    return merchStatus >= MembershipDeliverableStatus.Recieved ? 'Yes' : 'No'
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
        shirtSize:
            membership?.shirtSize === '2XL'
                ? 'XXL'
                : (membership?.shirtSize ?? undefined),
        isMember: membership?.duesPayingMember,
        eligibleForBenefits: membership?.membershipBenefitEligible,
        membershipTier: membershipTiers.find(
            (tier) => tier === customField?.label
        ),
        beganMembership: donor.contributions?.[0]?.createdAt
            ?.toISOString()
            .slice(0, 10),
        numberOfContributions: donor.contributions?.length,
        discordConfirmed:
            membership?.discordConfirmed ?? Boolean(user?.discordUsers?.length),
        nameConfirmed:
            membership?.nameConfirmed ?? user?.nameConfirmed ?? undefined,
        addressConfirmed:
            membership?.addressConfirmed ?? user?.addressConfirmed ?? undefined,
        cardPrinted: membership?.cardPrinted ?? undefined,
        labelPrinted: membership?.labelPrinted ?? undefined,
        cardPacked: membership?.itemsPackaged ?? undefined,
        benefitShipped: membership?.benefitsShipped ?? undefined,
        membershipCardStatus: cardStatus,
        membershipMerchStatus: merchStatus,
        packageShipped: packageShippedFromStatus(cardStatus),
        userMatched: Boolean(user),
    }
}

const toApiShirtSize = (size: ShirtSize): ApiShirtSize =>
    size === 'XXL' ? ApiShirtSize.DoubleExtraLarge : (size as ApiShirtSize)

const packageShippedStatus: Record<
    PackageShipped,
    MembershipDeliverableStatus
> = {
    Yes: MembershipDeliverableStatus.Recieved,
    No: MembershipDeliverableStatus.NotStarted,
    Returned: MembershipDeliverableStatus.Returned,
    'Not Received': MembershipDeliverableStatus.InTransit,
    Canceled: MembershipDeliverableStatus.NotEligible,
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
): FieldChange<ApiShirtSize> => {
    if (draft.shirtSize === undefined) return undefined
    if ((draft.shirtSize ?? undefined) === member.shirtSize) return undefined
    return draft.shirtSize == null ? null : toApiShirtSize(draft.shirtSize)
}

const resolveCardStatus = (member: Member, draft: MemberEdits) => {
    if (draft.packageShipped !== undefined) {
        if ((draft.packageShipped ?? undefined) === member.packageShipped)
            return undefined
        return draft.packageShipped == null
            ? undefined
            : packageShippedStatus[draft.packageShipped]
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
