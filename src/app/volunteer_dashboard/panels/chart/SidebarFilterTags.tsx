import { FilterTags, type FilterTag } from '../../layout/FilterTags'
import type { Position } from './domain/chart.types'
import styles from './page.module.css'
import { DropdownOverlay, DropdownOverlayButton } from '@/components/common'
import { stateOptions } from '@/models'
import { DOT_SEPARATOR, parseErrorMessage } from '@/util'
import { usePaginatedSearch } from '@/util/hooks'
import { zRole, type Role } from 'pv-contracts/data'
import { useState, type Key, type ReactElement, type ReactNode } from 'react'
import {
    FaUsers,
    FaBirthdayCake,
    FaMapMarkerAlt,
    FaSitemap,
    FaUserShield,
} from 'react-icons/fa'
import { FaClipboardUser, FaObjectGroup, FaCodeMerge } from 'react-icons/fa6'
import { MdVerified } from 'react-icons/md'

const currentYear = new Date().getFullYear()
const birthYears = Array.from(
    { length: currentYear - 1899 },
    (_, index) => currentYear - index
)

function FilterSubmenu<T>({
    label,
    icon,
    active,
    options,
    emptyMessage,
    optionKey,
    optionLabel,
    isSelected,
    onSelect,
    closeDropdown,
}: {
    label: string
    icon: ReactElement
    active: boolean
    options: T[]
    emptyMessage?: string
    optionKey: (option: T) => Key
    optionLabel: (option: T) => ReactNode
    isSelected: (option: T) => boolean
    onSelect: (option?: T) => void
    closeDropdown: () => void
}) {
    return (
        <DropdownOverlayButton
            icon={icon}
            selected={active}
            menu={({ closeMenu }) => (
                <div className={styles.filterMenu}>
                    {emptyMessage && !options.length && (
                        <p className={styles.emptyFilterMenu}>{emptyMessage}</p>
                    )}
                    {options.map((option) => (
                        <DropdownOverlayButton
                            key={optionKey(option)}
                            checked={isSelected(option)}
                            onCheckedChange={(checked) => {
                                onSelect(checked ? option : undefined)
                                closeMenu()
                                closeDropdown()
                            }}
                        >
                            {optionLabel(option)}
                        </DropdownOverlayButton>
                    ))}
                </div>
            )}
        >
            {label}
        </DropdownOverlayButton>
    )
}

export function SidebarFilterTags({ positions }: { positions: Position[] }) {
    const [activeTag, setActiveTag] = useState('all')
    const [state, setState] = useState<string>()
    const [birthYear, setBirthYear] = useState<number>()
    const [position, setPosition] = useState<Position>()
    const [role, setRole] = useState<Role>()
    const { query: rolesQuery } = usePaginatedSearch('/roles', zRole, {
        search: { limit: 50 },
        all: true,
    })

    const filterLabel =
        [
            stateOptions.find((option) => option.value === state)?.label,
            birthYear,
            position?.name,
            role?.name,
        ]
            .filter(Boolean)
            .join(` ${DOT_SEPARATOR} `) || 'All Items'
    const filterIcon = state ? (
        <FaMapMarkerAlt />
    ) : birthYear ? (
        <FaBirthdayCake />
    ) : position ? (
        <FaSitemap />
    ) : role ? (
        <FaUserShield />
    ) : (
        <FaUsers />
    )
    const tagDefaults = {
        width: '11.65rem',
        activeRedirect: 'all',
        scrollLeft: 'positions',
        scrollRight: 'all',
    }
    const tags: FilterTag[] = [
        {
            ...tagDefaults,
            key: 'positions',
            label: 'Positions',
            icon: <FaClipboardUser />,
            color: '#5997E0',
        },
        {
            ...tagDefaults,
            key: 'groups',
            label: 'Groups',
            icon: <FaObjectGroup />,
            color: '#62A46C',
        },
        {
            ...tagDefaults,
            key: 'lines',
            label: 'Lines',
            icon: <FaCodeMerge />,
            color: '#7674B3',
        },
        {
            ...tagDefaults,
            key: 'all',
            label: filterLabel,
            icon: filterIcon,
            color: '#3A3A3C',
            width: '8.4rem',
            activeRedirect: 'positions',
            dropdownOverlay: ({ closeDropdown }) => (
                <DropdownOverlay
                    label="Filter by"
                    onClose={closeDropdown}
                    narrowLayoutMode="trigger"
                    body={
                        <div className={styles.filterMenu}>
                            <DropdownOverlayButton icon={<MdVerified />}>
                                Verified
                            </DropdownOverlayButton>
                            <FilterSubmenu
                                label="Age"
                                icon={<FaBirthdayCake />}
                                active={birthYear !== undefined}
                                options={birthYears}
                                optionKey={(year) => year}
                                optionLabel={(year) => year}
                                isSelected={(year) => birthYear === year}
                                onSelect={(year) => {
                                    setState(undefined)
                                    setPosition(undefined)
                                    setBirthYear(year)
                                }}
                                closeDropdown={closeDropdown}
                            />
                            <FilterSubmenu
                                label="State"
                                icon={<FaMapMarkerAlt />}
                                active={state !== undefined}
                                options={stateOptions}
                                optionKey={(option) => option.value}
                                optionLabel={(option) => option.label}
                                isSelected={(option) => state === option.value}
                                onSelect={(option) => {
                                    setBirthYear(undefined)
                                    setPosition(undefined)
                                    setState(option?.value)
                                }}
                                closeDropdown={closeDropdown}
                            />
                            <FilterSubmenu
                                label="Position"
                                icon={<FaSitemap />}
                                active={position !== undefined}
                                options={positions}
                                emptyMessage="No positions available"
                                optionKey={(option) => option.id}
                                optionLabel={(option) => option.name}
                                isSelected={(option) =>
                                    position?.id === option.id
                                }
                                onSelect={(option) => {
                                    setBirthYear(undefined)
                                    setState(undefined)
                                    setPosition(option)
                                }}
                                closeDropdown={closeDropdown}
                            />
                            {rolesQuery.error && (
                                <p role="alert">
                                    {parseErrorMessage(rolesQuery.error)}
                                </p>
                            )}
                            <FilterSubmenu
                                label="Role"
                                icon={<FaUserShield />}
                                active={role !== undefined}
                                options={rolesQuery.data?.data ?? []}
                                emptyMessage="No roles available"
                                optionKey={(option) => option.id}
                                optionLabel={(option) => option.name}
                                isSelected={(option) => role?.id === option.id}
                                onSelect={setRole}
                                closeDropdown={closeDropdown}
                            />
                        </div>
                    }
                />
            ),
        },
    ]

    return (
        <FilterTags tags={tags} activeTag={activeTag} onChange={setActiveTag} />
    )
}
