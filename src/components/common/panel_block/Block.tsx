'use client'

import styles from './Block.module.css'
import { DropdownButton, DropdownMenu } from '@/components/common'
import { User } from '@/contracts/data'
import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
    type ReactNode,
    type RefObject,
} from 'react'
import { FaSave, FaTrashAlt } from 'react-icons/fa'

interface InfoBlockContextValue {
    user: User
    draft: User
    editing: boolean
    isCollapsed: boolean
    toggle: () => void
    closeMenu: () => void
    startEdit: () => void
    onDraftChange: (updater: (prev: User) => User) => void
}

const InfoBlockContext = createContext<InfoBlockContextValue | null>(null)

export function useInfoBlockContext(): InfoBlockContextValue {
    const ctx = useContext(InfoBlockContext)
    if (!ctx)
        throw new Error(
            'Block field components must be used inside <InfoBlock>'
        )
    return ctx
}

function HideButton() {
    const { isCollapsed, toggle } = useInfoBlockContext()
    return (
        <DropdownMenu.Button
            label={isCollapsed ? 'Show' : 'Hide'}
            onClick={toggle}
        />
    )
}

function EditButton() {
    const { closeMenu, startEdit } = useInfoBlockContext()
    return (
        <DropdownMenu.Button
            label="Edit"
            onClick={() => {
                closeMenu()
                startEdit()
            }}
        />
    )
}

export interface InfoBlockProps {
    title: string
    user: User
    boundaryRef?: RefObject<HTMLElement | null>
    menu?: ReactNode
    onSave?: (draft: User) => void
    editActionsPrefix?: ReactNode
    className?: string
    children: ReactNode
}

export function InfoBlock({
    title,
    user,
    boundaryRef,
    menu,
    onSave,
    editActionsPrefix,
    className,
    children,
}: InfoBlockProps) {
    const [editDraft, setEditDraft] = useState<User | null>(null)
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [bodyHeight, setBodyHeight] = useState(0)

    const menuButtonRef = useRef<HTMLButtonElement | null>(null)
    const bodyContentRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        const el = bodyContentRef.current
        if (!el) return
        setBodyHeight(el.scrollHeight)
        const observer = new ResizeObserver(() =>
            setBodyHeight(el.scrollHeight)
        )
        observer.observe(el)
        return () => observer.disconnect()
    }, [])

    const editing = editDraft != null
    const draft = editDraft ?? user
    const startEdit = () => setEditDraft(user)
    const handleSave = () => {
        if (editDraft) onSave?.(editDraft)
        setEditDraft(null)
    }
    const handleCancel = () => setEditDraft(null)
    const onDraftChange = (updater: (prev: User) => User) =>
        setEditDraft((prev) => updater(prev ?? user))

    const ctx: InfoBlockContextValue = {
        user,
        draft,
        editing,
        isCollapsed,
        toggle: () => {
            setIsCollapsed((c) => !c)
            setIsMenuOpen(false)
        },
        closeMenu: () => setIsMenuOpen(false),
        startEdit,
        onDraftChange,
    }

    return (
        <InfoBlockContext.Provider value={ctx}>
            <div
                className={[
                    styles.block,
                    isMenuOpen ? styles.blockMenuOpen : '',
                    className,
                ]
                    .filter(Boolean)
                    .join(' ')}
            >
                <div className={styles.header}>
                    <h1 className={styles.title}>{title}</h1>
                    {editing ? (
                        <div className={styles.headerActions}>
                            {editActionsPrefix}
                            <button
                                type="button"
                                className={`${styles.actionButton} ${styles.actionButtonSave}`}
                                onClick={handleSave}
                            >
                                <FaSave aria-hidden="true" />
                                Save
                            </button>
                            <button
                                type="button"
                                className={`${styles.actionButton} ${styles.actionButtonCancel}`}
                                onClick={handleCancel}
                            >
                                <FaTrashAlt aria-hidden="true" />
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <div className={styles.menuControl}>
                            <DropdownButton
                                ref={menuButtonRef}
                                buttonVariant="short"
                                isOpen={isMenuOpen}
                                aria-label={`${title} options`}
                                onClick={() => setIsMenuOpen((o) => !o)}
                                menu={
                                    <DropdownMenu
                                        triggerRef={menuButtonRef}
                                        onClose={() => setIsMenuOpen(false)}
                                        boundaryRef={boundaryRef}
                                        label="Quick Actions"
                                        role="menu"
                                        aria-label={`${title} menu`}
                                    >
                                        {menu}
                                    </DropdownMenu>
                                }
                            />
                        </div>
                    )}
                </div>
                <div
                    className={styles.body}
                    style={{ height: isCollapsed ? '0px' : `${bodyHeight}px` }}
                    aria-hidden={isCollapsed}
                >
                    <div ref={bodyContentRef} className={styles.bodyContent}>
                        {children}
                    </div>
                </div>
            </div>
        </InfoBlockContext.Provider>
    )
}

InfoBlock.HideButton = HideButton
InfoBlock.EditButton = EditButton
