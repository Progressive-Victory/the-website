'use client'

import {
    useListEditing,
    useListValueAlign,
    type ListRowValueAlign,
} from './ListContext'
import styles from './ListRow.module.css'
import { cn } from '@/util'
import { useId, type ReactNode } from 'react'

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

export interface ListRowLabelProps {
    id?: string
    label: ReactNode
    indicator?: ListRowIndicator
    labelAlign?: ListRowLabelAlign
    className?: string
}

export function ListRowLabel({
    id,
    label,
    indicator,
    labelAlign = 'center',
    className,
}: ListRowLabelProps) {
    const marker = indicator && indicators[indicator]

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
            {marker && (
                <span className={marker.className} title={marker.title}>
                    {marker.symbol}
                </span>
            )}
        </span>
    )
}

export interface ListRowBaseProps {
    label: ReactNode
    editing?: boolean
    readOnly?: boolean
    muted?: boolean
    indicator?: ListRowIndicator
    labelAlign?: ListRowLabelAlign
    valueAlign?: ListRowValueAlign
    emptyLabel?: ReactNode
    className?: string
}

export interface ListRowProps extends ListRowBaseProps {
    value?: ReactNode
    invalid?: boolean
    editor?: ReactNode | ((labelId: string) => ReactNode)
}

export function ListRow({
    valueAlign: valueAlignProp,
    ...props
}: ListRowProps) {
    const {
        label,
        value,
        editor,
        invalid,
        editing,
        readOnly,
        muted,
        indicator,
        labelAlign,
        emptyLabel = 'None',
        className,
    } = props
    const labelId = useId()
    const isEditing = useListEditing(editing)
    const valueAlign = useListValueAlign(valueAlignProp)
    const showEditor = isEditing && !readOnly && editor != null
    const empty =
        ('value' in props || editor != null) &&
        (value == null ||
            typeof value === 'boolean' ||
            (typeof value === 'string' && !value.trim()))

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
        </div>
    )
}
