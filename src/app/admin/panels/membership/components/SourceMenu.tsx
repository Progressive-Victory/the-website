'use client'

import { Member } from '../membership.types'
import { FieldHistory, FieldHistoryProps } from './FieldHistory'
import styles from './SourceMenu.module.css'
import tags from './Tags.module.css'
import { DropdownOverlay } from '@/components/common'
import { cn } from '@/util'
import { CSSProperties } from 'react'
import { FiCheck } from 'react-icons/fi'

export interface MemberSource {
    label: string
    value?: string
}

const SourceCheck = ({ selected }: { selected: boolean }) => (
    <span className={styles.sourceCheck}>
        {selected && <FiCheck className={styles.sourceIndicator} />}
    </span>
)

const SourceValueTag = ({
    value,
    confirmed,
}: {
    value?: string
    confirmed?: boolean
}) =>
    value ? (
        <span
            className={cn(
                tags.tag,
                tags.tagWide,
                confirmed === true && tags.tagGreen,
                confirmed === false && tags.tagRed,
                confirmed == null && tags.tagGray
            )}
        >
            {value}
        </span>
    ) : (
        <span className={cn(tags.tag, tags.tagWide, tags.tagGhost)}>
            Unfilled
        </span>
    )

const IdenticalTag = ({ source }: { source?: string }) => (
    <span className={cn(tags.tag, tags.tagWide, tags.tagGray)}>
        {source ? `Identical To ${source}` : 'Identical'}
    </span>
)

export interface SourceMenuProps {
    member: Member
    title: string
    sources: MemberSource[]
    onClose: () => void
    overlayWidth: string
    labelWidth: string
    format?: (value: string) => string
    normalize?: (value: string) => string
    confirmed?: boolean
    confirmedSource?: string
    history?: Omit<FieldHistoryProps, 'member'>
}

export const SourceMenu = ({
    member,
    title,
    sources,
    onClose,
    overlayWidth,
    labelWidth,
    format = (value) => value,
    normalize = (value) => value.trim(),
    confirmed,
    confirmedSource,
    history,
}: SourceMenuProps) => {
    const rows = sources.map((source) => ({
        ...source,
        matchKey: source.value ? normalize(source.value) : undefined,
    }))

    const displayedLabel = rows.find((row) => row.value)?.label
    const allIdentical =
        new Set(rows.flatMap((row) => row.matchKey ?? [])).size === 1

    return (
        <DropdownOverlay
            label={title}
            onClose={onClose}
            className={styles.sourceOverlay}
            bodyClassName={styles.sourceOverlayBody}
            style={
                {
                    left: 0,
                    right: 'auto',
                    '--source-overlay-width': overlayWidth,
                    '--source-label-width': labelWidth,
                } as CSSProperties
            }
            body={
                <>
                    {rows.map((row, index) => {
                        const identicalTo = row.matchKey
                            ? rows
                                  .slice(0, index)
                                  .find(
                                      (earlier) =>
                                          earlier.matchKey === row.matchKey
                                  )
                            : undefined

                        return (
                            <div key={row.label} className={styles.sourceRow}>
                                <SourceCheck
                                    selected={displayedLabel === row.label}
                                />
                                <span className={styles.sourceLabel}>
                                    {row.label}
                                </span>
                                {identicalTo ? (
                                    <IdenticalTag
                                        source={
                                            allIdentical
                                                ? undefined
                                                : identicalTo.label
                                        }
                                    />
                                ) : (
                                    <SourceValueTag
                                        value={
                                            row.value
                                                ? format(row.value)
                                                : undefined
                                        }
                                        confirmed={
                                            (confirmedSource ??
                                                displayedLabel) === row.label
                                                ? confirmed
                                                : undefined
                                        }
                                    />
                                )}
                            </div>
                        )
                    })}
                    {history && <FieldHistory member={member} {...history} />}
                </>
            }
        />
    )
}
