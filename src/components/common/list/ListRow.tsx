'use client'

import {
    useListEditing,
    useListLoading,
    useListValueAlign,
    type ListRowValueAlign,
} from './ListContext'
import styles from './ListRow.module.css'
import skeleton from '@/components/common/Skeleton.module.css'
import { DropdownButton, DropdownOverlay } from '@/components/common/dropdown'
import { cn } from '@/util'
import { useId, type ReactNode } from 'react'
import { HiOutlineInformationCircle } from 'react-icons/hi2'

const labelAlignClasses = {
    top: styles.labelTop,
    center: styles.labelCenter,
    bottom: styles.labelBottom,
}

const valueAlignClasses: Record<ListRowValueAlign, string> = {
    left: styles.valueLeft,
    center: styles.valueCenter,
    right: styles.valueRight,
}

const indicators = {
    required: {
        symbol: '*',
        title: 'Required Field',
        className: styles.required,
    },
    deprecated: {
        symbol: '**',
        title: 'Deprecated Field',
        className: styles.deprecated,
    },
    unsupported: {
        symbol: '*',
        title: 'Not Supported Yet',
        className: styles.unsupported,
    },
}

export type ListRowIndicator = keyof typeof indicators
export type ListRowLabelAlign = keyof typeof labelAlignClasses
export type { ListRowValueAlign }

const SKELETON_WIDTHS = ['45%', '60%', '35%', '70%', '50%']

export function ListRowSkeletonBar({ seed }: { seed: string }) {
    const hash = [...seed].reduce((sum, char) => sum + char.charCodeAt(0), 0)

    return (
        <span
            className={skeleton.bar}
            style={{ width: SKELETON_WIDTHS[hash % SKELETON_WIDTHS.length] }}
        />
    )
}

const isEmptyValue = (value: ReactNode) =>
    value == null ||
    typeof value === 'boolean' ||
    (typeof value === 'string' && !value.trim())

export interface ListRowLabelProps {
    id?: string
    label: ReactNode
    sublabel?: ReactNode
    indicator?: ListRowIndicator
    labelAlign?: ListRowLabelAlign
    className?: string
}

function IndicatorMarker({ indicator }: { indicator: ListRowIndicator }) {
    const marker = indicators[indicator]

    return (
        <span
            tabIndex={0}
            aria-label={marker.title}
            data-indicator
            className={cn(styles.indicator, marker.className)}
        >
            {marker.symbol}
            <span role="tooltip" aria-hidden="true" className={styles.legend}>
                {Object.entries(indicators).map(([key, item]) => (
                    <span
                        key={key}
                        className={cn(
                            styles.legendItem,
                            key === indicator && styles.legendItemActive
                        )}
                    >
                        <span
                            className={cn(item.className, styles.legendSymbol)}
                        >
                            {item.symbol}
                        </span>
                        {item.title}
                    </span>
                ))}
            </span>
        </span>
    )
}

export function ListRowLabel({
    id,
    label,
    sublabel,
    indicator,
    labelAlign = 'center',
    className,
}: ListRowLabelProps) {
    return (
        <span
            id={id}
            data-align={labelAlign}
            className={cn(
                styles.label,
                labelAlignClasses[labelAlign],
                className
            )}
        >
            {label}
            {indicator && <IndicatorMarker indicator={indicator} />}
            {sublabel && <span className={styles.sublabel}>{sublabel}</span>}
        </span>
    )
}

export interface ListRowBaseProps {
    label: ReactNode
    sublabel?: ReactNode
    editing?: boolean
    readOnly?: boolean
    muted?: boolean
    indicator?: ListRowIndicator
    labelAlign?: ListRowLabelAlign
    valueAlign?: ListRowValueAlign
    emptyLabel?: ReactNode
    details?:
        ReactNode | ((controls: { closeDropdown: () => void }) => ReactNode)
    className?: string
}

export interface ListRowProps extends ListRowBaseProps {
    value?: ReactNode
    invalid?: boolean
    editor?: ReactNode | ((labelId: string) => ReactNode)
    skeletonLines?: number
}

interface ListRowSkeletonProps extends Pick<
    ListRowBaseProps,
    'label' | 'indicator' | 'labelAlign' | 'className'
> {
    labelId: string
    valueAlign: ListRowValueAlign
    lines?: number
}

function ListRowSkeleton({
    labelId,
    label,
    indicator,
    labelAlign,
    valueAlign,
    lines = 1,
    className,
}: ListRowSkeletonProps) {
    return (
        <div className={cn(styles.row, className)}>
            <ListRowLabel
                id={labelId}
                label={label}
                indicator={indicator}
                labelAlign={labelAlign}
            />
            <div
                data-align={valueAlign}
                className={cn(
                    styles.value,
                    styles.skeletonLines,
                    valueAlignClasses[valueAlign]
                )}
            >
                {Array.from({ length: lines }, (_, line) => (
                    <div key={line}>
                        <ListRowSkeletonBar seed={`${labelId}${line}`} />
                    </div>
                ))}
            </div>
        </div>
    )
}

function ListRowMenuButton({
    label,
    details,
    editing,
}: Pick<ListRowBaseProps, 'label' | 'details' | 'editing'>) {
    if (editing) return null
    if (!details) return null

    const title = typeof label === 'string' ? `${label} Details` : 'Details'

    return (
        <div className={styles.menuButton}>
            <DropdownButton
                buttonVariant="plain"
                className={styles.menuTrigger}
                title={title}
                aria-label={title}
                menu={({ closeDropdown }) => (
                    <DropdownOverlay
                        onClose={closeDropdown}
                        body={
                            typeof details === 'function'
                                ? details({ closeDropdown })
                                : details
                        }
                    />
                )}
            >
                <HiOutlineInformationCircle size={23} />
            </DropdownButton>
        </div>
    )
}

export function ListRow({
    valueAlign: valueAlignProp,
    ...props
}: ListRowProps) {
    const {
        label,
        sublabel,
        value,
        editor,
        invalid,
        editing,
        readOnly,
        muted,
        indicator,
        labelAlign,
        emptyLabel = 'None',
        details,
        skeletonLines,
        className,
    } = props
    const labelId = useId()
    const isEditing = useListEditing(editing)
    const loading = useListLoading()
    const valueAlign = useListValueAlign(valueAlignProp)
    const showEditor = isEditing && !readOnly && editor != null
    const empty = ('value' in props || editor != null) && isEmptyValue(value)

    if (loading)
        return (
            <ListRowSkeleton
                labelId={labelId}
                label={label}
                indicator={indicator}
                labelAlign={labelAlign}
                valueAlign={valueAlign}
                lines={skeletonLines}
                className={className}
            />
        )

    return (
        <div
            className={cn(
                styles.row,
                showEditor && styles.editing,
                showEditor && invalid && styles.invalid,
                className
            )}
        >
            <ListRowLabel
                id={labelId}
                label={label}
                sublabel={sublabel}
                indicator={indicator}
                labelAlign={labelAlign}
            />
            <div
                data-align={valueAlign}
                className={cn(
                    styles.value,
                    valueAlignClasses[valueAlign],
                    muted && !showEditor && styles.muted,
                    empty && !showEditor && styles.muted
                )}
            >
                {showEditor
                    ? typeof editor === 'function'
                        ? editor(labelId)
                        : editor
                    : empty
                      ? emptyLabel
                      : value}
            </div>
            <ListRowMenuButton
                label={label}
                details={details}
                editing={showEditor}
            />
        </div>
    )
}
