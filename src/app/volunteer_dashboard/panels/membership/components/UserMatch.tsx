'use client'

import {
    useLinkDonorToUser,
    useUserByDiscord,
    useUserByEmail,
    useUserByName,
    useUserByPhone,
} from '../hooks'
import { formatPhone } from '../membership.helpers'
import { Member } from '../membership.types'
import styles from './UserMatch.module.css'
import { UserProfile } from 'pv-contracts/data'

export interface UserMatchProps {
    member: Member
    onLinked: () => void
}

interface UserMatchSuggestionProps extends UserMatchProps {
    match?: UserProfile
    detail?: string
    hasValue: boolean
    isLoading: boolean
    isError: boolean
    missingMessage: string
    emptyMessage: string
}

const UserMatchSuggestion = ({
    member,
    onLinked,
    match,
    detail,
    hasValue,
    isLoading,
    isError,
    missingMessage,
    emptyMessage,
}: UserMatchSuggestionProps) => {
    const linkMutation = useLinkDonorToUser()
    const donorEmail = member.donorEmail

    const statusMessage = !hasValue
        ? missingMessage
        : isLoading
          ? 'Searching users…'
          : isError
            ? 'Failed to search users'
            : match == null
              ? emptyMessage
              : undefined

    const displayName =
        match?.preferredName ??
        [match?.firstName, match?.lastName].filter(Boolean).join(' ')

    return (
        <div className={styles.matchSection}>
            <span className={styles.matchSectionLabel}>Suggested User</span>
            {statusMessage ? (
                <div className={styles.matchEmpty}>{statusMessage}</div>
            ) : (
                <div className={styles.matchContainer}>
                    <div className={styles.matchEntry}>
                        <span className={styles.matchEntryMain}>
                            <span className={styles.matchEntryName}>
                                {displayName || `User ${match?.id}`}
                            </span>
                            <span className={styles.matchEntryDetail}>
                                {detail}
                            </span>
                        </span>
                        <button
                            type="button"
                            className={styles.matchButton}
                            disabled={
                                donorEmail == null ||
                                match == null ||
                                linkMutation.isPending
                            }
                            onClick={() => {
                                if (donorEmail == null || match == null) return
                                linkMutation.mutate(
                                    { donorEmail, userId: match.id },
                                    { onSuccess: onLinked }
                                )
                            }}
                        >
                            {linkMutation.isPending ? 'Linking…' : 'Match'}
                        </button>
                    </div>
                </div>
            )}
            {linkMutation.isError && (
                <div className={styles.matchEmpty}>Failed to link user</div>
            )}
        </div>
    )
}

export const EmailUserMatch = ({ member, onLinked }: UserMatchProps) => {
    const email = member.donorEmail ?? member.discordEmail
    const { match, isLoading, isError } = useUserByEmail(email)

    return (
        <UserMatchSuggestion
            member={member}
            onLinked={onLinked}
            match={match}
            detail={match?.email ?? undefined}
            hasValue={email != null}
            isLoading={isLoading}
            isError={isError}
            missingMessage="No email to match on"
            emptyMessage="No user found with this email"
        />
    )
}

export const PhoneUserMatch = ({ member, onLinked }: UserMatchProps) => {
    const phone = member.donorPhone ?? member.phone
    const { match, matchedPhone, isLoading, isError } = useUserByPhone(phone)

    return (
        <UserMatchSuggestion
            member={member}
            onLinked={onLinked}
            match={match}
            detail={matchedPhone && formatPhone(matchedPhone)}
            hasValue={phone != null}
            isLoading={isLoading}
            isError={isError}
            missingMessage="No phone number to match on"
            emptyMessage="No user found with this phone number"
        />
    )
}

export const DiscordUserMatch = ({ member, onLinked }: UserMatchProps) => {
    const handle = member.discordUsername ?? member.contributionDiscord
    const { match, matchedHandle, isLoading, isError } =
        useUserByDiscord(handle)

    return (
        <UserMatchSuggestion
            member={member}
            onLinked={onLinked}
            match={match}
            detail={matchedHandle && `@${matchedHandle}`}
            hasValue={handle != null}
            isLoading={isLoading}
            isError={isError}
            missingMessage="No Discord handle to match on"
            emptyMessage="No user found with this Discord handle"
        />
    )
}

export const NameUserMatch = ({ member, onLinked }: UserMatchProps) => {
    const name = member.donorName ?? member.userName
    const { match, ambiguous, isLoading, isError } = useUserByName(name)

    return (
        <UserMatchSuggestion
            member={member}
            onLinked={onLinked}
            match={match}
            detail={match?.email ?? undefined}
            hasValue={name != null}
            isLoading={isLoading}
            isError={isError}
            missingMessage="No name to match on"
            emptyMessage={
                ambiguous
                    ? 'Multiple users share this name'
                    : 'No user found with this name'
            }
        />
    )
}
