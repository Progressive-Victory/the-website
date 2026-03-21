'use client'

import { useInfoBlockContext } from '../Block'
import { BlockField } from './BlockField'
import blockFieldStyles from './BlockField.module.css'
import { useState } from 'react'

export function NameBlockField() {
    const { user, draft, editing, onDraftChange } = useInfoBlockContext()
    const [focusedField, setFocusedField] = useState<
        'firstName' | 'lastName' | null
    >(null)

    if (editing) {
        return (
            <>
                <div className={blockFieldStyles.infoBlockFieldRow}>
                    <span className={blockFieldStyles.infoBlockFieldLabel}>
                        First Name
                    </span>
                    <input
                        className={blockFieldStyles.infoBlockFieldInput}
                        value={draft.firstName ?? ''}
                        placeholder={
                            focusedField === 'firstName'
                                ? (user.firstName ?? '')
                                : 'Empty'
                        }
                        onFocus={() => setFocusedField('firstName')}
                        onBlur={() => setFocusedField(null)}
                        onChange={(e) =>
                            onDraftChange((u) => ({
                                ...u,
                                firstName: e.target.value || null,
                            }))
                        }
                        aria-label="First name"
                    />
                </div>
                <div className={blockFieldStyles.infoBlockFieldRow}>
                    <span className={blockFieldStyles.infoBlockFieldLabel}>
                        Last Name
                    </span>
                    <input
                        className={blockFieldStyles.infoBlockFieldInput}
                        value={draft.lastName ?? ''}
                        placeholder={
                            focusedField === 'lastName'
                                ? (user.lastName ?? '')
                                : 'Empty'
                        }
                        onFocus={() => setFocusedField('lastName')}
                        onBlur={() => setFocusedField(null)}
                        onChange={(e) =>
                            onDraftChange((u) => ({
                                ...u,
                                lastName: e.target.value || null,
                            }))
                        }
                        aria-label="Last name"
                    />
                </div>
            </>
        )
    }

    return (
        <BlockField
            label="Name"
            ariaLabel="Name info"
            getter={(u) => {
                const full = [u.firstName?.trim(), u.lastName?.trim()]
                    .filter(Boolean)
                    .join(' ')
                const preferred = u.preferredName?.trim()
                return full.length > 0
                    ? full
                    : preferred?.length
                      ? preferred
                      : undefined
            }}
        />
    )
}
