import { InformationCircleIcon } from '@heroicons/react/24/solid'
import { ReactElement } from 'react'

export function Toggle({
    name,
    value,
    onChange,
    placeholder,
    tooltip,
    required = false,
}: {
    name: string
    value: boolean
    onChange: () => void
    placeholder?: string | ReactElement
    tooltip?: string
    required?: boolean
}) {
    return (
        <div className="flex flex-row items-center justify-between gap-2 rounded-md bg-gray-700 p-2">
            <div className="flex w-full flex-row items-center gap-1.5 md:gap-2">
                <div
                    tabIndex={0}
                    className="touch-pan-zoom group relative size-4 shrink-0  cursor-pointer md:size-[1.125rem]"
                >
                    <InformationCircleIcon className=" size-4 rounded-full bg-white text-steel-blue md:size-[1.125rem]" />
                    <div className="pointer-events-none absolute top-0 z-10 flex flex-col items-center rounded-md bg-black px-px py-2 text-center text-sm text-gray-700 opacity-0 transition-all duration-100 group-hover:translate-y-[25px] group-hover:opacity-75 group-focus:translate-y-[25px] group-focus:opacity-75">
                        <span className="min-w-[300px] text-center text-xs text-white">
                            {tooltip}
                        </span>
                    </div>
                </div>

                <label
                    htmlFor={name}
                    className="w-full text-[10px] text-white lg:text-xs"
                >
                    {placeholder}
                </label>
            </div>

            <div className="relative ml-auto inline-block w-10 shrink-0 select-none align-middle lg:ml-0 lg:mr-2">
                <label
                    className={`${
                        value ? 'bg-steel-blue' : 'bg-gray-500'
                    } block h-6 cursor-pointer overflow-hidden rounded-full transition-all duration-300`}
                    htmlFor={name}
                >
                    <input
                        type="checkbox"
                        name={name}
                        id={name}
                        required={required}
                        checked={value}
                        onChange={onChange}
                        className="absolute opacity-0"
                    />
                    <span
                        className={`${
                            value
                                ? 'translate-x-4 bg-white shadow-lg'
                                : 'translate-x-0 bg-white'
                        } absolute block size-6 rounded-full transition-all duration-300`}
                    />
                </label>
            </div>
        </div>
    )
}
