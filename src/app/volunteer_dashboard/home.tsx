import styles from './page.module.css'
import { DiscordAvatar } from '@/components/common'
import { Detail } from '@/components/common/navigation_stack/detail/Detail'
import { NavigationButton } from '@/components/common/navigation_stack/navigation_button/NavigationButton'
import { cn } from '@/util'
import type { ReactElement } from 'react'
import { FaDonate, FaUserShield, FaUserTag, FaUsers } from 'react-icons/fa'
import {
    FaCheckToSlot,
    FaClipboardUser,
    FaDollarSign,
    FaMoneyBills,
    FaMoneyCheckDollar,
} from 'react-icons/fa6'

function renderUnselectedGridHeader(label: string): ReactElement {
    return (
        <div className={styles.unselectedGridHeader}>
            <span className={styles.unselectedGridHeaderText}>{label}</span>
            <span
                aria-hidden="true"
                className={styles.unselectedGridHeaderLine}
            />
        </div>
    )
}

export interface VolunteerDashboardUnselectedDetailProps {
    showWelcome?: boolean
    currentUserName?: string
    currentUserHandle?: string
    currentUserDiscordId?: string
    currentUserDiscordImage?: string
    userCount?: number
    donorCount?: number
    contributionCount?: number
    roleCount?: number
    permissionCount?: number
    positionCount?: number
    endorsementCount?: number
}

export function renderVolunteerDashboardUnselectedDetail({
    showWelcome,
    currentUserName,
    currentUserHandle,
    currentUserDiscordId,
    currentUserDiscordImage,
    userCount,
    donorCount,
    contributionCount,
    roleCount,
    permissionCount,
    positionCount,
    endorsementCount,
}: VolunteerDashboardUnselectedDetailProps): ReactElement {
    const displayName = currentUserName?.trim()
        ? currentUserName
        : currentUserHandle
          ? `@${currentUserHandle}`
          : 'User'

    return (
        <Detail
            bodyType="blank"
            body={
                <div className={styles.unselectedView}>
                    <div className={styles.unselectedProfileHeader}>
                        <DiscordAvatar
                            discordUserId={currentUserDiscordId}
                            imageId={currentUserDiscordImage}
                            size={132}
                            className={styles.unselectedAvatar}
                        />
                        <div
                            className={cn(
                                styles.unselectedNameSlot,
                                !showWelcome &&
                                    styles.unselectedNameSlotImmediate
                            )}
                        >
                            {showWelcome && (
                                <div className={styles.unselectedWelcome}>
                                    Welcome Back
                                </div>
                            )}
                            <h2 className={styles.unselectedProfileName}>
                                {displayName}
                            </h2>
                            {currentUserHandle && (
                                <div className={styles.unselectedProfileHandle}>
                                    @{currentUserHandle}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className={styles.unselectedGrid}>
                        {renderUnselectedGridHeader('Organization')}
                        <NavigationButton
                            label="Members"
                            description="Member accounts and profiles."
                            href="/volunteer_dashboard/panels/members"
                            icon={FaUsers}
                            tag={{ count: userCount }}
                            buttonType="card"
                            resetPanelHistoryOnClick
                        />
                        <NavigationButton
                            label="Endorsements"
                            description="Endorsement records and candidate details."
                            href="/volunteer_dashboard/panels/endorsements"
                            icon={FaCheckToSlot}
                            tag={{ count: endorsementCount }}
                            buttonType="card"
                            resetPanelHistoryOnClick
                        />
                    </div>
                    <div className={styles.unselectedGrid}>
                        {renderUnselectedGridHeader('Fundraising')}
                        <NavigationButton
                            label="Fundraising"
                            description="Donors, contributions, and fundraising stats."
                            href="/volunteer_dashboard/panels/fundraising"
                            icon={FaDonate}
                            buttonType="card"
                            resetPanelHistoryOnClick
                        />
                        <NavigationButton
                            label="Memberships"
                            description="Dues Paying Membership switchboard."
                            href="/volunteer_dashboard/panels/membership"
                            icon={FaMoneyCheckDollar}
                            tag={{ count: 92 }}
                            buttonType="card"
                            resetPanelHistoryOnClick
                        />
                        <NavigationButton
                            label="Donors"
                            description="ActBlue donors, totals, and records."
                            href="/volunteer_dashboard/panels/donors"
                            icon={FaDollarSign}
                            tag={{ count: donorCount }}
                            buttonType="card"
                            resetPanelHistoryOnClick
                        />
                        <NavigationButton
                            label="Contributions"
                            description="Contributions, lineitems, and payment info."
                            href="/volunteer_dashboard/panels/contributions"
                            icon={FaMoneyBills}
                            tag={{ count: contributionCount }}
                            buttonType="card"
                            resetPanelHistoryOnClick
                        />
                    </div>
                    <div className={styles.unselectedGrid}>
                        {renderUnselectedGridHeader('Roles & Permissions')}
                        <NavigationButton
                            label="Roles"
                            description="User roles and access levels."
                            href="/volunteer_dashboard/panels/roles"
                            icon={FaUserTag}
                            tag={{ count: roleCount }}
                            buttonType="card"
                            resetPanelHistoryOnClick
                        />
                        <NavigationButton
                            label="Permissions"
                            description="Granular permission definitions."
                            href="/volunteer_dashboard/panels/permissions"
                            icon={FaUserShield}
                            tag={{ count: permissionCount }}
                            buttonType="card"
                            resetPanelHistoryOnClick
                        />
                        <NavigationButton
                            label="Positions"
                            description="Staff and volunteer position records."
                            href="/volunteer_dashboard/panels/positions"
                            icon={FaClipboardUser}
                            tag={{ count: positionCount }}
                            buttonType="card"
                            resetPanelHistoryOnClick
                        />
                    </div>
                </div>
            }
        />
    )
}
