'use client'

import styles from './List.module.css'
import {
    ListContext,
    type ListFormState,
    type ListRowValueAlign,
} from './ListContext'
import { cn } from '@/util'
import { useCollapse } from '@/util/hooks/useCollapse'
import {
    Children,
    isValidElement,
    useContext,
    useMemo,
    useState,
    type CSSProperties,
    type ReactNode,
} from 'react'
import { flushSync } from 'react-dom'

const ANIMATION_MS = 420
const UNMOUNT_BUFFER_MS = 80

export function ListBreak({ editingOnly = false }: { editingOnly?: boolean }) {
    void editingOnly
    return null
}

function splitCards(children: ReactNode, editing: boolean): ReactNode[][] {
    const cards: ReactNode[][] = [[]]
    for (const child of Children.toArray(children)) {
        if (isValidElement(child) && child.type === ListBreak) {
            if (!child.props.editingOnly || editing) cards.push([])
        } else cards[cards.length - 1].push(child)
    }
    return cards.filter((card) => card.length > 0)
}

export interface ListProps {
    title?: ReactNode
    disclaimer?: string
    defaultCollapsed?: boolean
    editing?: boolean
    valueAlign?: ListRowValueAlign
    className?: string
    children?: ReactNode
    dynamic?: ListFormState
    id?: string
}

export function List({
    title,
    disclaimer,
    defaultCollapsed,
    editing,
    valueAlign,
    className,
    children,
    dynamic,
}: ListProps) {
    const parent = useContext(ListContext)
    const formState = dynamic ?? parent.formState
    const isEditing = editing ?? dynamic?.editing ?? parent.editing
    const rowValueAlign = valueAlign ?? parent.valueAlign
    const context = useMemo(
        () => ({
            editing: isEditing,
            valueAlign: rowValueAlign,
            formState,
        }),
        [isEditing, rowValueAlign, formState]
    )
    const { isOpen, shouldRender, contentHeight, contentRef, toggle } =
        useCollapse({
            initialOpen: !defaultCollapsed,
            animationMs: ANIMATION_MS + UNMOUNT_BUFFER_MS,
        })
    const [animating, setAnimating] = useState(false)

    const handleToggle = () => {
        flushSync(() => setAnimating(true))
        contentRef.current?.getBoundingClientRect()
        toggle()
    }

    return (
        <section
            className={styles.section}
            style={{ '--list-duration': `${ANIMATION_MS}ms` } as CSSProperties}
        >
            {title && (
                <div className={styles.header}>
                    <h3 className={styles.title}>{title}</h3>
                    <button
                        type="button"
                        className={styles.toggle}
                        aria-expanded={isOpen}
                        aria-label={isOpen ? 'Collapse' : 'Expand'}
                        onClick={handleToggle}
                    >
                        <span className={styles.chevron} />
                    </button>
                </div>
            )}
            {shouldRender && (
                <div
                    className={styles.collapse}
                    data-open={isOpen}
                    data-animating={animating}
                >
                    <div
                        ref={contentRef}
                        className={cn(styles.list, className)}
                        style={
                            {
                                '--list-open-height': `${contentHeight}px`,
                            } as CSSProperties
                        }
                        onTransitionEnd={(event) =>
                            event.target === event.currentTarget &&
                            event.propertyName === 'max-height' &&
                            setAnimating(false)
                        }
                    >
                        <ListContext.Provider value={context}>
                            {splitCards(children, isEditing).map(
                                (card, index) => (
                                    <div key={index} className={styles.card}>
                                        {card}
                                    </div>
                                )
                            )}
                        </ListContext.Provider>
                    </div>
                    {disclaimer && (
                        <p className={styles.disclaimer}>{disclaimer}</p>
                    )}
                </div>
            )}
        </section>
    )
}
