import { ReactElement } from 'react'
import { InformationCircleIcon } from '@heroicons/react/24/solid'
export function Toggle({
    value, // Value
    onChange, // Value setter
    placeholder, // Label and placeholder text
    tooltip,
}: {
    value: boolean
    onChange: () => void
    placeholder?: string | ReactElement
    tooltip?: string
}) {
    return (
        <div className="flex flex-row items-center justify-between rounded-md bg-gray-700 p-2">
            <div className="flex flex-row items-center">
                <div
                    tabIndex={0}
                    className="touch-pan-zoom group relative cursor-pointer"
                >
                    <InformationCircleIcon className="mr-1 size-4 rounded-full bg-white text-steel-blue" />
                    <div className="pointer-events-none absolute top-0 z-10 flex flex-col items-center rounded-md bg-black px-px py-2 text-center text-sm text-gray-700 opacity-0 transition-all duration-100 group-hover:translate-y-[25px] group-hover:opacity-75 group-focus:translate-y-[25px] group-focus:opacity-75">
                        <span className="min-w-[300px] text-center text-xs text-white">
                            {tooltip}
                        </span>
                    </div>
                </div>

                <label className="text-[10px] text-white lg:text-sm">
                    {placeholder}
                </label>
            </div>

            <div
                className="relative ml-auto inline-block w-10 select-none align-middle lg:ml-0 lg:mr-2"
                onClick={() => {
                    onChange()
                }}
            >
                <label
                    className={`${
                        value ? 'bg-steel-blue' : 'bg-gray-500'
                    } block h-6 cursor-pointer overflow-hidden rounded-full transition-all duration-300`}
                    htmlFor="toggle"
                >
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
