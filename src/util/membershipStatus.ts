import { MembershipDeliverableStatus } from 'pv-contracts/data'

export const packageShippedOptions = [
    'Yes',
    'No',
    'Returned',
    'Not Received',
    'Canceled',
] as const

export type PackageShipped = (typeof packageShippedOptions)[number]

// The API's enum names do not match what these states mean to us.
const statusByPackageShipped: Record<
    PackageShipped,
    MembershipDeliverableStatus
> = {
    Yes: MembershipDeliverableStatus.Recieved,
    No: MembershipDeliverableStatus.NotEligible,
    Returned: MembershipDeliverableStatus.Returned,
    'Not Received': MembershipDeliverableStatus.NotStarted,
    Canceled: MembershipDeliverableStatus.InTransit,
}

// Printed has no label of its own, so it reads as not shipped.
const packageShippedByStatus: Record<
    MembershipDeliverableStatus,
    PackageShipped
> = {
    [MembershipDeliverableStatus.NotEligible]: 'No',
    [MembershipDeliverableStatus.NotStarted]: 'Not Received',
    [MembershipDeliverableStatus.Printed]: 'No',
    [MembershipDeliverableStatus.InTransit]: 'Canceled',
    [MembershipDeliverableStatus.Recieved]: 'Yes',
    [MembershipDeliverableStatus.Returned]: 'Returned',
}

/** Member-facing wording; admin surfaces show the PackageShipped value itself. */
const memberFacingLabels: Record<PackageShipped, string> = {
    Yes: 'Card Shipped',
    No: 'Not Shipped Yet',
    Returned: 'Delivery Failed - Fix Address',
    'Not Received': 'Not Received - Fix Address',
    Canceled: 'Requested To Cancel',
}

export const toDeliverableStatus = (
    value: PackageShipped
): MembershipDeliverableStatus => statusByPackageShipped[value]

export const toPackageShipped = (
    status?: MembershipDeliverableStatus
): PackageShipped | undefined =>
    status == null ? undefined : packageShippedByStatus[status]

/** Maps Printed onto the status its shared label writes back. */
export const canonicalDeliverableStatus = (
    status?: MembershipDeliverableStatus
): MembershipDeliverableStatus | undefined => {
    const value = toPackageShipped(status)
    return value && statusByPackageShipped[value]
}

export const deliverableStatusOptions = packageShippedOptions.map((value) => ({
    value: statusByPackageShipped[value],
    label: value,
}))

export const memberFacingDeliverableLabel = (
    status?: MembershipDeliverableStatus
): string | undefined => {
    const value = toPackageShipped(status)
    return value && memberFacingLabels[value]
}
