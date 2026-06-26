import styles from './admin.module.css'
import { DiscordAvatar } from '@/components/common'
import { Nav } from '@/components/common/nav'
import { Detail, clearPanelHistory } from '@/components/common/split_view'
import type { ReactElement } from 'react'
import { FaDonate, FaUserShield, FaUserTag, FaUsers } from 'react-icons/fa'
import { FaClipboardUser, FaDollarSign, FaFlask } from 'react-icons/fa6'

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

export function renderAdminUnselectedDetail({
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
}: {
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
}): ReactElement {
    return (
        <Detail>
            <Detail.Body>
                <div className={styles.unselectedView}>
                    <div className={styles.unselectedProfileHeader}>
                        <DiscordAvatar
                            discordUserId={currentUserDiscordId}
                            imageId={currentUserDiscordImage}
                            size={132}
                            className={styles.unselectedAvatar}
                        />
                        <div
                            className={`${styles.unselectedNameSlot}${showWelcome ? '' : ` ${styles.unselectedNameSlotImmediate}`}`}
                        >
                            {showWelcome && (
                                <div className={styles.unselectedWelcome}>
                                    Welcome Back
                                </div>
                            )}
                            <h2 className={styles.unselectedProfileName}>
                                {(currentUserName?.trim()
                                    ? currentUserName
                                    : undefined) ??
                                    (currentUserHandle
                                        ? `@${currentUserHandle}`
                                        : 'Admin User')}
                            </h2>
                            {currentUserHandle ? (
                                <div className={styles.unselectedProfileHandle}>
                                    @{currentUserHandle}
                                </div>
                            ) : null}
                        </div>
                    </div>
                    <div className={styles.unselectedGrid}>
                        {renderUnselectedGridHeader('Organization')}
                        <Nav.Item
                            variant="card"
                            label="Members"
                            description="Member accounts and profiles."
                            href="/admin/panels/members"
                            icon={FaUsers}
                            count={userCount}
                            onClick={clearPanelHistory}
                        />

                        <Nav.Item
                            variant="card"
                            label="Positions"
                            description="Staff and volunteer position records."
                            href="/admin/panels/positions"
                            icon={FaClipboardUser}
                            count={0}
                            onClick={clearPanelHistory}
                        />
                    </div>
                    <div className={styles.unselectedGrid}>
                        {renderUnselectedGridHeader('Fundraising')}
                        <Nav.Item
                            variant="card"
                            label="Fundraising"
                            description="Donors, contributions, and fundraising stats."
                            href="/admin/panels/fundraising"
                            icon={FaDonate}
                            onClick={clearPanelHistory}
                        />
                        <Nav.Item
                            variant="card"
                            label="Donors"
                            description="ActBlue donors, totals, and records."
                            href="/admin/panels/donors"
                            icon={FaDonate}
                            count={donorCount}
                            onClick={clearPanelHistory}
                        />
                        <Nav.Item
                            variant="card"
                            label="Contributions"
                            description="Contribution lineitems and payment info."
                            href="/admin/panels/contributions"
                            icon={FaDollarSign}
                            count={contributionCount}
                            onClick={clearPanelHistory}
                        />
                    </div>
                    <div className={styles.unselectedGrid}>
                        {renderUnselectedGridHeader('Roles & Permissions')}
                        <Nav.Item
                            variant="card"
                            label="Roles"
                            description="User roles and access levels."
                            href="/admin/panels/roles"
                            icon={FaUserTag}
                            count={roleCount}
                            onClick={clearPanelHistory}
                        />
                        <Nav.Item
                            variant="card"
                            label="Permissions"
                            description="Granular permission definitions."
                            href="/admin/panels/permissions"
                            icon={FaUserShield}
                            count={permissionCount}
                            onClick={clearPanelHistory}
                        />
                    </div>
                    <div className={styles.unselectedGrid}>
                        {renderUnselectedGridHeader('Developer')}
                        <Nav.Item
                            variant="card"
                            label="Test"
                            description="Test panel for development and debugging."
                            href="/admin/panels/test"
                            icon={FaFlask}
                            onClick={clearPanelHistory}
                        />
                    </div>
                </div>
            </Detail.Body>
        </Detail>
    )
}
