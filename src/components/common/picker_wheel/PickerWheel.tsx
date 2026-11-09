'use client'

import styles from './PickerWheel.module.css'
import { cn } from '@/util'
import {
    useEffect,
    useId,
    useRef,
    type CSSProperties,
    type KeyboardEvent,
} from 'react'

export interface PickerWheelOption<V extends string | number> {
    value: V
    label: string
}

export interface PickerWheelProps<V extends string | number> {
    options: PickerWheelOption<V>[]
    value?: V | null
    onChange: (value: V) => void
    onPick?: (value: V) => void
    disabled?: boolean
    visibleCount?: number
    itemHeight?: number
    id?: string
    className?: string
    'aria-label'?: string
}

const SETTLE_DELAY = 120
const TYPEAHEAD_DELAY = 700

export function PickerWheel<V extends string | number>({
    options,
    value,
    onChange,
    onPick,
    disabled,
    visibleCount = 5,
    itemHeight = 32,
    id,
    className,
    'aria-label': ariaLabel,
}: PickerWheelProps<V>) {
    const optionIdPrefix = useId()
    const listRef = useRef<HTMLDivElement>(null)
    const targetIndex = useRef<number | null>(null)
    const emittedValue = useRef<V>(undefined)
    const settleTimeout = useRef<ReturnType<typeof setTimeout>>(undefined)
    const typeaheadTimeout = useRef<ReturnType<typeof setTimeout>>(undefined)
    const typeahead = useRef('')
    const lastScrollTop = useRef(0)
    const verticalScrollPending = useRef(false)

    const selectedIndex = options.findIndex((option) => option.value === value)
    const clampIndex = (index: number) =>
        Math.max(0, Math.min(options.length - 1, index))

    const scrollToIndex = (index: number) => {
        targetIndex.current = clampIndex(index)
        listRef.current?.scrollTo({
            top: targetIndex.current * itemHeight,
            behavior: 'smooth',
        })
    }

    useEffect(() => {
        const fromScroll =
            emittedValue.current !== undefined && emittedValue.current === value
        emittedValue.current = undefined
        const list = listRef.current
        const top = selectedIndex * itemHeight
        if (
            !fromScroll &&
            list &&
            selectedIndex >= 0 &&
            Math.abs(list.scrollTop - top) > 1
        )
            list.scrollTop = top
    }, [value, selectedIndex, itemHeight])

    useEffect(() => {
        if (!disabled) listRef.current?.focus()
    }, [disabled])

    useEffect(
        () => () => {
            clearTimeout(settleTimeout.current)
            clearTimeout(typeaheadTimeout.current)
        },
        []
    )

    const commitScrollPosition = () => {
        const list = listRef.current
        if (!list || !verticalScrollPending.current) return
        verticalScrollPending.current = false
        targetIndex.current = null
        const option =
            options[clampIndex(Math.round(list.scrollTop / itemHeight))]
        if (!option || option.value === value) return
        emittedValue.current = option.value
        onChange(option.value)
    }

    const handleScroll = () => {
        const scrollTop = listRef.current?.scrollTop
        if (scrollTop === undefined || scrollTop === lastScrollTop.current)
            return
        lastScrollTop.current = scrollTop
        verticalScrollPending.current = true
        if ('onscrollend' in window) return
        clearTimeout(settleTimeout.current)
        settleTimeout.current = setTimeout(commitScrollPosition, SETTLE_DELAY)
    }

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        const current =
            targetIndex.current ??
            Math.round((listRef.current?.scrollTop ?? 0) / itemHeight)
        const centered = options[clampIndex(current)]
        if (event.key === 'Enter' && onPick && centered) {
            event.preventDefault()
            return onPick(centered.value)
        }

        const page = visibleCount - 1
        const keyTargets: Record<string, number> = {
            ArrowUp: current - 1,
            ArrowDown: current + 1,
            PageUp: current - page,
            PageDown: current + page,
            Home: 0,
            End: options.length - 1,
        }

        let next: number | undefined = keyTargets[event.key]
        if (
            next === undefined &&
            event.key.length === 1 &&
            !event.ctrlKey &&
            !event.metaKey &&
            !event.altKey
        ) {
            event.preventDefault()
            const letter = event.key.toLocaleLowerCase()
            const query = `${typeahead.current}${letter}`
            const repeatedLetter = [...query].every(
                (character) => character === letter
            )
            const search = repeatedLetter ? letter : query
            typeahead.current = query
            clearTimeout(typeaheadTimeout.current)
            typeaheadTimeout.current = setTimeout(() => {
                typeahead.current = ''
            }, TYPEAHEAD_DELAY)
            const matches = (index: number) =>
                options[index]?.label.toLocaleLowerCase().startsWith(search)
            const after = options.findIndex(
                (_, index) => index > current && matches(index)
            )
            next = after >= 0 ? after : options.findIndex((_, i) => matches(i))
            if (next < 0) return
        } else if (next !== undefined) {
            typeahead.current = ''
            clearTimeout(typeaheadTimeout.current)
        }
        if (next === undefined) return

        event.preventDefault()
        scrollToIndex(next)
    }

    const handleItemClick = (index: number) => {
        const centered = Math.round(
            (listRef.current?.scrollTop ?? 0) / itemHeight
        )
        if (onPick && index === centered) return onPick(options[index].value)
        scrollToIndex(index)
    }

    return (
        <div
            className={cn(
                styles.pickerWheel,
                disabled && styles.disabled,
                className
            )}
            style={
                {
                    '--picker-item-height': `${itemHeight}px`,
                    '--picker-visible-count': visibleCount,
                } as CSSProperties
            }
        >
            <div
                ref={listRef}
                id={id}
                role="listbox"
                aria-label={ariaLabel}
                aria-disabled={disabled}
                aria-activedescendant={
                    selectedIndex >= 0
                        ? `${optionIdPrefix}-${selectedIndex}`
                        : undefined
                }
                tabIndex={disabled ? -1 : 0}
                className={styles.list}
                onScroll={handleScroll}
                onScrollEnd={commitScrollPosition}
                onKeyDown={handleKeyDown}
            >
                {options.map((option, index) => (
                    <div
                        key={option.value}
                        id={`${optionIdPrefix}-${index}`}
                        role="option"
                        aria-selected={index === selectedIndex}
                        className={styles.item}
                        onClick={() => handleItemClick(index)}
                    >
                        <span className={styles.label}>{option.label}</span>
                        <span className={styles.boldLabel} aria-hidden="true">
                            {option.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}
