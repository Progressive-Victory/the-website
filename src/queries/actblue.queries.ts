import { normalizePhone } from '@/app/volunteer_dashboard/panels/membership/membership.helpers'
import { useCurrentUser, useFetch } from '@/util/hooks'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
    ActBlueDonor,
    UserAddress,
    zActBlueDonationPacket,
    zUser,
} from 'pv-contracts/data'
import {
    ActBlueDonorLinkRequest,
    SearchRequest,
    UpdateMembershipRequest,
    UpdateUserAddressRequest,
    UpdateUserRequest,
} from 'pv-contracts/requests'
import {
    zPaginatedResponse,
    zActBlueFundraisingStatsResponse,
} from 'pv-contracts/responses'

export function useActblueQueries() {
    const { ready, onGet } = useFetch()

    return {
        ready,
        getContributions: (options?: {
            search?: SearchRequest
            signal?: AbortSignal
        }) => {
            const { search, signal } = options ?? {}
            return onGet(
                '/actblue/contributions',
                zPaginatedResponse(zActBlueDonationPacket),
                { query: search, signal }
            )
        },
        getFundraisingStats: (options?: {
            startDate?: string
            endDate?: string
            signal?: AbortSignal
        }) => {
            const { startDate, endDate, signal } = options ?? {}
            return onGet(
                '/actblue/fundraising/stats',
                zActBlueFundraisingStatsResponse,
                { query: { startDate, endDate }, signal }
            )
        },
    }
}

type LinkableDonor = Pick<
    ActBlueDonor,
    | 'email'
    | 'firstname'
    | 'lastname'
    | 'phone'
    | 'addr1'
    | 'city'
    | 'state'
    | 'zip'
>

const addressKeys = [
    'addressLine1',
    'addressLine2',
    'city',
    'state',
    'zip',
] as const

type AddressKey = (typeof addressKeys)[number]

const textKey = (value: string) =>
    value.toLowerCase().replace(/[.,#]/g, '').replace(/\s+/g, ' ').trim()

const stateKey = (value: string) => value.trim().toUpperCase()

const zipKey = (value: string) => value.replace(/\D/g, '').slice(0, 5)

const addressKeyFns: Record<AddressKey, (value: string) => string> = {
    addressLine1: textKey,
    addressLine2: textKey,
    city: textKey,
    state: stateKey,
    zip: zipKey,
}

const limitText = (value: string | null, max: number) => {
    const trimmed = value?.trim()
    return trimmed && trimmed.length <= max ? trimmed : undefined
}

const exactLength = (value: string, length: number) =>
    value.length === length ? value : undefined

const buildAddressFill = (
    userAddress: UserAddress | null | undefined,
    donor: LinkableDonor
): UpdateUserAddressRequest | undefined => {
    const donorAddress: Partial<Record<AddressKey, string>> = {
        addressLine1: limitText(donor.addr1, 100),
        city: limitText(donor.city, 50),
        state: exactLength(stateKey(donor.state ?? ''), 2),
        zip: exactLength(zipKey(donor.zip ?? ''), 5),
    }
    const userValue = (key: AddressKey) =>
        userAddress?.[key]?.trim() ?? undefined

    const isSame = (key: AddressKey) => {
        const user = userValue(key)
        const donorValue = donorAddress[key]
        if (!user) return false
        if (!donorValue) return false
        return addressKeyFns[key](user) === addressKeyFns[key](donorValue)
    }

    const matches = (key: AddressKey) => {
        if (donorAddress[key]) return isSame(key)
        return key === 'addressLine2' && isSame('addressLine1')
    }

    const filledKeys = addressKeys.filter((key) => userValue(key))
    if (!filledKeys.every(matches)) return

    const request: UpdateUserAddressRequest = {}
    for (const key of addressKeys) {
        const donorValue = donorAddress[key]
        if (!userValue(key) && donorValue) request[key] = donorValue
    }

    return Object.keys(request).length > 0 ? request : undefined
}

export function useLinkDonorToUser(dataSource: string) {
    const { onGet, onPost, onPatch } = useFetch()
    const loggedInUser = useCurrentUser()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            donor,
            userId,
        }: {
            donor: LinkableDonor
            userId: number
        }) => {
            const metaData = {
                dataSource,
                userWhoUpdatedId: loggedInUser.data?.id,
            }
            const params = { donorEmail: donor.email }

            await onPost(
                '/actblue/donors/:donorEmail/link',
                { userId, metaData } satisfies ActBlueDonorLinkRequest,
                null,
                { params }
            )

            await onPatch(
                '/actblue/donors/:donorEmail/membership',
                {
                    discordConfirmed: true,
                    metaData,
                } satisfies UpdateMembershipRequest,
                null,
                { params }
            )

            const user = await onGet('/users/:userId', zUser, {
                params: { userId },
            })
            const firstName = donor.firstname?.trim()
            const lastName = donor.lastname?.trim()
            const email = donor.email.trim()
            const phone = normalizePhone(donor.phone ?? '')
            const address = buildAddressFill(user.address, donor)

            const request: UpdateUserRequest = {}
            if (!user.firstName?.trim() && !user.lastName?.trim()) {
                if (firstName) request.firstName = firstName
                if (lastName) request.lastName = lastName
            }
            if (!user.email?.trim() && email) request.email = email
            if (!user.phone?.trim() && phone) request.phone = phone
            if (address) request.address = address
            if (Object.keys(request).length === 0) return

            await onPatch(
                '/users/:userId',
                { ...request, metaData } satisfies UpdateUserRequest,
                zUser,
                { params: { userId } }
            )
        },
        onSuccess: (_, { userId }) =>
            Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ['/actblue/memberships'],
                }),
                queryClient.invalidateQueries({
                    queryKey: [`/users/${userId}`],
                }),
            ]),
        onError: (error) => console.error(error),
    })
}

export function useUnlinkDonorFromUser(dataSource: string) {
    const { onPost, onPatch } = useFetch()
    const loggedInUser = useCurrentUser()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            donorEmail,
        }: {
            donorEmail: string
            userId: number
        }) => {
            const metaData = {
                dataSource,
                userWhoUpdatedId: loggedInUser.data?.id,
            }
            const params = { donorEmail }

            await onPost(
                '/actblue/donors/:donorEmail/link',
                { userId: null, metaData } satisfies ActBlueDonorLinkRequest,
                null,
                { params }
            )

            await onPatch(
                '/actblue/donors/:donorEmail/membership',
                {
                    discordConfirmed: false,
                    metaData,
                } satisfies UpdateMembershipRequest,
                null,
                { params }
            )
        },
        onSuccess: (_, { userId }) =>
            Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ['/actblue/memberships'],
                }),
                queryClient.invalidateQueries({
                    queryKey: [`/users/${userId}`],
                }),
            ]),
        onError: (error) => console.error(error),
    })
}
