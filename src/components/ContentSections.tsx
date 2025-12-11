'use client'

import styles from '@/app/styles/components/ContentSections.module.css'
import { PlusIcon, MinusIcon } from '@heroicons/react/24/solid'
import type React from 'react'
import { useState, useRef, useEffect } from 'react'

type TitleAlign = 'left' | 'center' | 'right'
type BodyType = 'text' | 'dropdown'

interface DropdownItem {
    question: string
    answer: string
}

interface InfoSectionProps {
    title: string
    highlight?: string
    highlightColor?: string
    titleAlign?: TitleAlign
    bodyType?: BodyType
    dropdownItems?: DropdownItem[]
    children?: React.ReactNode
}

export function ContentSection({
    title,
    highlight,
    highlightColor,
    titleAlign,
    bodyType = 'text',
    dropdownItems,
    children,
}: InfoSectionProps) {
    const defaultHighlightColor = '#CE3728'
    const alignment: TitleAlign = titleAlign ?? 'left'
    const [openIndex, setOpenIndex] = useState<number | null>(null)

    let renderedTitle: React.ReactNode = title

    if (highlight) {
        const index = title.indexOf(highlight)
        if (index !== -1) {
            const before = title.slice(0, index)
            const after = title.slice(index + highlight.length)

            renderedTitle = (
                <>
                    {before}
                    <span
                        style={{
                            color: highlightColor ?? defaultHighlightColor,
                        }}
                    >
                        {highlight}
                    </span>
                    {after}
                </>
            )
        }
    }

    let bodyContent: React.ReactNode

    if (bodyType === 'dropdown' && dropdownItems && dropdownItems.length > 0) {
        bodyContent = (
            <div className={styles.dropdownBody}>
                {dropdownItems.map((item, index) => (
                    <DropdownQuestion
                        key={item.question}
                        question={item.question}
                        answer={item.answer}
                        isOpen={openIndex === index}
                        onToggle={() =>
                            setOpenIndex((prev) =>
                                prev === index ? null : index
                            )
                        }
                    />
                ))}
            </div>
        )
    } else {
        bodyContent = <div className={styles.textBody}>{children}</div>
    }

    const alignmentClass =
        alignment === 'center'
            ? styles.alignCenter
            : alignment === 'right'
              ? styles.alignRight
              : styles.alignLeft

    return (
        <section className={styles.infoSection}>
            <p className={`${styles.infoSectionTitle} ${alignmentClass}`}>
                {renderedTitle}
            </p>

            {bodyContent}
        </section>
    )
}

interface DropdownQuestionProps {
    question: string
    answer: string
    isOpen: boolean
    onToggle: () => void
}

function DropdownQuestion({
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

interface ContentPageFrameProps {
    children: React.ReactNode
    heading?: React.ReactNode
}

export function ContentPageFrame({ children, heading }: ContentPageFrameProps) {
    return (
        <div className={styles.pageWrapper}>
            {heading && <div className={styles.pageHeader}>{heading}</div>}
            {children}
        </div>
    )
}
