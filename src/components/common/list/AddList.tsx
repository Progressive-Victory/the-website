'use client'

import styles from './AddList.module.css'
import { List, type ListProps } from './List'
import { useListEditing } from './ListContext'
import { useListField, type ListRowFieldProps } from './useListField'
import { SearchModal } from '@/app/volunteer_dashboard/layout/SearchModal'
import { cn } from '@/util'
import { useState, useSyncExternalStore, type Key, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

export interface ListItem {
    id: Key
    label: ReactNode
    searchText?: string
    description?: ReactNode
}

export interface AddListProps
    extends
        Omit<ListProps, 'children'>,
        Omit<ListRowFieldProps<ListItem[]>, 'value'> {
    items?: ListItem[]
    options?: ListItem[]
    pickerTitle?: string
    pickerSubtitle?: string
    addLabel?: ReactNode
    emptyLabel?: ReactNode
    onAdd?: () => void
    onRemove?: (id: Key) => void
}

export interface AddListItemProps {
    label: ReactNode
    removeLabel?: string
    onRemove?: () => void
    accessory?: ReactNode
    className?: string
}

export function AddListItem({
    label,
    removeLabel,
    onRemove,
    accessory,
    className,
}: AddListItemProps) {
    const editing = useListEditing()

    return (
        <div
            className={cn(
                styles.itemRow,
                editing && styles.itemRowEditing,
                className
            )}
        >
            <button
                type="button"
                className={styles.removeButton}
                aria-label={`Remove ${removeLabel ?? (typeof label === 'string' ? label : 'item')}`}
                aria-hidden={!editing}
                tabIndex={editing ? 0 : -1}
                onClick={onRemove}
            >
                −
            </button>
            <span className={styles.itemLabel}>{label}</span>
            {accessory != null && (
                <span className={styles.itemAccessory}>{accessory}</span>
            )}
        </div>
    )
}

export interface AddListButtonProps {
    children: ReactNode
    onClick?: () => void
}

export function AddListButton({ children, onClick }: AddListButtonProps) {
    return (
        <button type="button" className={styles.addRow} onClick={onClick}>
            <span className={styles.addIcon}>+</span>
            {children}
        </button>
    )
}

export function AddListEmptyRow({ children }: { children: ReactNode }) {
    return <div className={styles.emptyRow}>{children}</div>
}

type AddListItemsProps = Omit<AddListProps, keyof ListProps>

function AddListItems({
    items,
    onValueChange: onValueChangeProp,
    field,
    getter,
    setter,
    validator,
    options,
    pickerTitle,
    pickerSubtitle,
    addLabel = 'Add',
    emptyLabel = 'None',
    onAdd,
    onRemove,
}: AddListItemsProps) {
    const editing = useListEditing()
    const { value, onValueChange } = useListField<ListItem[]>(
        {
            value: items,
            onValueChange: onValueChangeProp,
            field,
            getter,
            setter,
            validator,
        },
        { required: false, isEmpty: (value) => !value?.length }
    )
    const current = value ?? []

    return (
        <>
            {!current.length && !editing && (
                <AddListEmptyRow>{emptyLabel}</AddListEmptyRow>
            )}
            {current.map((item) => (
                <AddListItem
                    key={item.id}
                    label={item.label}
                    onRemove={() => {
                        onRemove?.(item.id)
                        onValueChange(
                            current.filter((other) => other.id !== item.id)
                        )
                    }}
                />
            ))}
            {editing &&
                (options ? (
                    <AddListPicker
                        label={addLabel}
                        title={
                            pickerTitle ??
                            (typeof addLabel === 'string' ? addLabel : 'Add')
                        }
                        subtitle={
                            pickerSubtitle ?? 'Search for an item to add.'
                        }
                        options={options.filter(
                            (option) =>
                                !current.some((item) => item.id === option.id)
                        )}
                        onPick={(option) => onValueChange([...current, option])}
                    />
                ) : (
                    <AddListButton onClick={onAdd}>{addLabel}</AddListButton>
                ))}
        </>
    )
}

const subscribeNoop = () => () => undefined

function AddListPicker({
    label,
    title,
    subtitle,
    options,
    onPick,
}: {
    label: ReactNode
    title: string
    subtitle: string
    options: ListItem[]
    onPick: (option: ListItem) => void
}) {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState('')
    const mounted = useSyncExternalStore(
        subscribeNoop,
        () => true,
        () => false
    )
    const query = search.trim().toLowerCase()
    const matches = options.filter(
        (option) =>
            !query ||
            (
                option.searchText ??
                (typeof option.label === 'string' ? option.label : '')
            )
                .toLowerCase()
                .includes(query)
    )
    const close = () => {
        setOpen(false)
        setSearch('')
    }

    return (
        <>
            <AddListButton onClick={() => setOpen(true)}>{label}</AddListButton>
            {mounted &&
                createPortal(
                    <SearchModal
                        open={open}
                        onClose={close}
                        title={title}
                        subtitle={subtitle}
                        searchValue={search}
                        onSearchChange={(event) =>
                            setSearch(event.target.value)
                        }
                    >
                        {matches.map((option) => (
                            <button
                                key={option.id}
                                type="button"
                                className={styles.pickerItem}
                                onClick={() => {
                                    onPick(option)
                                    close()
                                }}
                            >
                                <span className={styles.pickerItemName}>
                                    {option.label}
                                </span>
                                {option.description && (
                                    <span className={styles.pickerItemSub}>
                                        {option.description}
                                    </span>
                                )}
                            </button>
                        ))}
                        {matches.length === 0 && (
                            <div className={styles.pickerEmpty}>No matches</div>
                        )}
                    </SearchModal>,
                    document.body
                )}
        </>
    )
}

export function AddList({
    items,
    onValueChange,
    field,
    getter,
    setter,
    validator,
    options,
    pickerTitle,
    pickerSubtitle,
    addLabel,
    emptyLabel,
    onAdd,
    onRemove,
    ...listProps
}: AddListProps) {
    return (
        <List {...listProps}>
            <AddListItems
                items={items}
                onValueChange={onValueChange}
                field={field}
                getter={getter}
                setter={setter}
                validator={validator}
                options={options}
                pickerTitle={pickerTitle}
                pickerSubtitle={pickerSubtitle}
                addLabel={addLabel}
                emptyLabel={emptyLabel}
                onAdd={onAdd}
                onRemove={onRemove}
            />
        </List>
    )
}
