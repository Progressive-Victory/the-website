import { Filter } from '@/components/admin/PaginatedList'
import { useClickAway } from '@uidotdev/usehooks'
import classNames from 'classnames'
import { createRef, FC } from 'react'
import { FaPlus } from 'react-icons/fa6'

type MultiSelectProps = Filter & {
    readonly?: boolean
    active: string[]
    addActive: (value: string) => void
    removeActive: (value: string) => void
    menuOpen: boolean
    setMenuOpen: (value: boolean) => void
    disabled?: boolean
}

const MultiSelect: FC<MultiSelectProps> = ({
    name,
    readonly,
    options,
    display_key,
    value_key,
    active,
    addActive,
    removeActive,
    menuOpen,
    setMenuOpen,
    disabled,
}) => {
    const buttonRef = createRef<HTMLButtonElement>()
    const menuRef = useClickAway<HTMLDivElement>((e) => {
        const contains =
            buttonRef.current === e.target! ||
            buttonRef.current!.contains(e.target! as Node)

        if (!contains) {
            setMenuOpen(false)
        }
    })

    return (
        <>
            {active.map((v) => (
                <button
                    disabled={(disabled ?? false) || readonly}
                    key={v}
                    onClick={() => removeActive(v)}
                    className={classNames(
                        'rounded-xl border border-gray-200 px-2 text-sm text-gray-700',
                        !readonly &&
                            'cursor-pointer select-none hover:text-red-400 hover:line-through disabled:cursor-not-allowed disabled:text-gray-700 disabled:no-underline'
                    )}
                >
                    {options.find((o) => o[value_key] === v)![display_key]}
                </button>
            ))}
            {active.length === 0 && readonly && <span>None</span>}
            {active.length < options.length && (
                <div className="relative">
                    {!readonly && (
                        <button
                            ref={buttonRef}
                            disabled={disabled}
                            className="flex aspect-square w-6 cursor-pointer items-center justify-center rounded-xl border border-gray-200 text-sm text-gray-600 hover:text-gray-700 disabled:cursor-not-allowed"
                            title={`Add ${name}`}
                            onClick={() => setMenuOpen(!menuOpen)}
                        >
                            <FaPlus size={11} />
                        </button>
                    )}
                    {menuOpen && (
                        <div
                            ref={menuRef}
                            className="absolute left-0 top-[calc(100%+0.25rem)] h-56 w-48 overflow-y-auto rounded-lg border-2 border-gray-200 bg-gray-50 p-2"
                            style={{ boxShadow: '0 0 8px 2px #00000008' }}
                        >
                            {options
                                .filter((v) => !active.includes(v[value_key]))
                                .map((v, i) => (
                                    <button
                                        key={i}
                                        className="block w-full cursor-pointer overflow-x-hidden rounded-md px-2 py-1 text-left hover:bg-gray-200"
                                        onClick={() => {
                                            addActive(v[value_key])
                                            setMenuOpen(false)
                                        }}
                                    >
                                        {v[display_key]}
                                    </button>
                                ))}
                        </div>
                    )}
                </div>
            )}
        </>
    )
}

export default MultiSelect
