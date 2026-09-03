'use client'

import { DropdownQuestion } from '@/components/DropdownQuestion'
import styles from '@/components/content_sections/ContentSections.module.css'
import { cn } from '@/util'
import type React from 'react'
import { useState } from 'react'

type TitleAlign = 'left' | 'center' | 'right'
type BodyType = 'text' | 'dropdown'

interface DropdownItem {
    question: string
    answer: string
}

export interface InfoSectionProps {
    title: string
    subtitle?: string
    highlight?: string
    highlightColor?: string
    titleAlign?: TitleAlign
    bodyType?: BodyType
    dropdownItems?: DropdownItem[]
    children?: React.ReactNode
}

export function ContentSection({
    title,
    subtitle,
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
    let renderedSubtitle: React.ReactNode = subtitle

    if (highlight) {
        const titleIndex = title.indexOf(highlight)
        if (titleIndex !== -1) {
            const before = title.slice(0, titleIndex)
            const after = title.slice(titleIndex + highlight.length)

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

        if (subtitle) {
            const subtitleIndex = subtitle.indexOf(highlight)
            if (subtitleIndex !== -1) {
                const before = subtitle.slice(0, subtitleIndex)
                const after = subtitle.slice(subtitleIndex + highlight.length)

                renderedSubtitle = (
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
    }

    const alignmentClass =
        alignment === 'center'
            ? styles.alignCenter
            : alignment === 'right'
              ? styles.alignRight
              : styles.alignLeft

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

    return (
        <section className={styles.infoSection}>
            <p className={cn(styles.infoSectionTitle, alignmentClass)}>
                {renderedTitle}
                {subtitle && (
                    <>
                        <br />
                        <span className={styles.infoSectionSubtitle}>
                            {renderedSubtitle}
                        </span>
                    </>
                )}
            </p>

            {bodyContent}
        </section>
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
