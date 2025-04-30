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
        <div className="flex flex-row items-center justify-between bg-gray-700 p-2 rounded-md">
            <div className="flex flex-row items-center">
                <div
                    tabIndex={0}
                    className="group relative touch-pan-zoom cursor-pointer"
                >
                    <InformationCircleIcon className="w-4 h-4 mr-1 text-steel-blue bg-white rounded-full" />
                    <div className="absolute z-10 top-0 opacity-0 group-hover:opacity-75 group-focus:opacity-75 group-hover:translate-y-[25px] group-focus:translate-y-[25px] transition-all duration-100 flex pointer-events-none flex-col items-center bg-black rounded-md py-2 px-px text-center text-gray-700 text-sm">
                        <span className="min-w-[300px] text-xs text-white text-center">
                            {tooltip}
                        </span>
                    </div>
                </div>

                <label className="text-white text-[10px] lg:text-sm">
                    {placeholder}
                </label>
            </div>

            <div
                className="relative inline-block w-10 ml-auto lg:ml-0 lg:mr-2 align-middle select-none"
                onClick={() => {
                    onChange()
                }}
            >
                <label
                    className={`${
                        value ? 'bg-steel-blue' : 'bg-gray-500'
                    } block overflow-hidden h-6 rounded-full cursor-pointer transition-all duration-300`}
                    htmlFor="toggle"
                >
                    <span
                        className={`${
                            value
                                ? 'translate-x-4 bg-white shadow-lg'
                                : 'translate-x-0 bg-white'
                        } absolute block w-6 h-6 rounded-full transition-all duration-300`}
                    />
                </label>
            </div>
        </div>
    )
}
