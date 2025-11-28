'use client'

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

export function InfoSection({
    title,
    highlight,
    highlightColor,
    titleAlign,
    bodyType = 'text',
    dropdownItems,
    children,
}: InfoSectionProps) {
    const defaultHighlightColor = '#CE3728'
    const alignment = titleAlign ?? 'left'
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
            <div
                style={{
                    paddingTop: '1.5rem',
                    paddingBottom: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                }}
            >
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
        bodyContent = (
            <div
                style={{
                    whiteSpace: 'pre-line',
                    paddingTop: '0.5rem',
                    paddingBottom: '0rem',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                }}
            >
                {children}
            </div>
        )
    }

    return (
        <section
            style={{
                margin: '1.5rem',
                borderRadius: '0.5rem',
                backgroundColor: '#09223a',
                paddingTop: '1.5rem',
                paddingBottom: '2rem',
                paddingInline: '2rem',
                color: 'white',
            }}
        >
            <p
                style={{
                    marginTop: 0.5,
                    marginRight: 0,
                    marginLeft: 0,
                    marginBottom: '0.5rem',
                    textAlign: alignment,
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    lineHeight: 1.2,
                }}
            >
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
            style={{
                position: 'relative',
                marginInline: '2rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem',
                borderRadius: '0.375rem',
                backgroundColor: '#ffffff',
                padding: '1rem',
                border: 'none',
                cursor: 'pointer',
            }}
        >
            <div
                style={{
                    marginTop: '1.25rem',
                    display: 'flex',
                    width: '100%',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                }}
            >
                <h2
                    style={{
                        textAlign: 'left',
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        margin: 0,
                        color: '#000000',
                    }}
                >
                    {question}
                </h2>
                <span style={iconWrapperStyle}>
                    {isOpen ? (
                        <MinusIcon style={iconStyle} />
                    ) : (
                        <PlusIcon style={iconStyle} />
                    )}
                </span>
            </div>

            <div
                style={{
                    width: '100%',
                    height,
                    transition: 'height 0.2s ease',
                    overflow: 'hidden',
                }}
            >
                <div
                    ref={contentRef}
                    style={{
                        paddingBottom: '1rem',
                        paddingRight: '2.5rem',
                        pointerEvents: 'auto',
                        userSelect: 'text',
                        textAlign: 'justify',
                        fontSize: '1.125rem',
                        color: '#09223a',
                    }}
                >
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
        <>
            <div className="pageWrapper">
                {heading && (
                    <div
                        style={{
                            width: '100%',
                            textAlign: 'center',
                            marginBottom: '2rem',
                        }}
                    >
                        {heading}
                    </div>
                )}
                {children}
            </div>

            <style jsx>{`
                .pageWrapper {
                    min-width: 100vw;
                    z-index: 2;
                    position: relative;
                    margin: 0 auto;
                    display: flex;
                    flex-direction: column;
                    width: 100%;
                    min-height: 100vh;
                    text-align: justify;
                    letter-spacing: 0.025em;
                    padding-block: 2rem;
                    padding-inline: 1.5rem;
                    max-width: 100%;
                }

                @media (min-width: 768px) {
                    .pageWrapper {
                        padding-block: 4rem;
                        padding-inline: 4rem;
                    }
                }

                @media (min-width: 1024px) {
                    .pageWrapper {
                        max-width: 80%;
                        padding-block: 3rem;
                        padding-inline: 15rem;
                    }
                }
            `}</style>
        </>
    )
}
