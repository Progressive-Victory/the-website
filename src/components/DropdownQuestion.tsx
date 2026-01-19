'use client'

import styles from '@/app/styles/components/ContentSections.module.css'
import { PlusIcon, MinusIcon } from '@heroicons/react/24/solid'
import type React from 'react'
import { useEffect, useRef, useState } from 'react'

export interface DropdownQuestionProps {
    question: string
    answer: string
    isOpen: boolean
    onToggle: () => void
}

export function DropdownQuestion({
    question,
    answer,
    isOpen,
    onToggle,
}: DropdownQuestionProps) {
    const contentRef = useRef<HTMLDivElement | null>(null)
    const [height, setHeight] = useState(0)

    useEffect(() => {
        if (contentRef.current) {
            setHeight(isOpen ? contentRef.current.scrollHeight : 0)
        }
    }, [isOpen])

    const iconWrapperStyle: React.CSSProperties = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '2rem',
        height: '2rem',
        flexShrink: 0,
        transition: 'transform 0.25s ease-out',
        transform: isOpen
            ? 'rotate(180deg) scale(1.05)'
            : 'rotate(0deg) scale(1)',
        transformOrigin: '50% 50%',
    }

    const iconStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        color: '#09223a',
    }

    return (
        <button
            type="button"
            onClick={onToggle}
            className={styles.dropdownButton}
        >
            <div className={styles.dropdownHeaderRow}>
                <h2 className={styles.dropdownQuestionTitle}>{question}</h2>

                <span style={iconWrapperStyle}>
                    {isOpen ? (
                        <MinusIcon style={iconStyle} />
                    ) : (
                        <PlusIcon style={iconStyle} />
                    )}
                </span>
            </div>

            <div className={styles.dropdownAnswerOuter} style={{ height }}>
                <div ref={contentRef} className={styles.dropdownAnswerInner}>
                    {answer}
                </div>
            </div>
        </button>
    )
}
