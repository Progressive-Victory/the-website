const DropDown = ({
    label,
    options,
    defaultOption,
    updateState,
    required,
}: {
    label?: string
    options: string[]
    defaultOption?: string
    updateState?: (selectedOption: string) => void
    required?: boolean
}) => {
    return (
        <div className="flex flex-col items-start justify-center">
            {label && (
                <label className="mb-[3px] inline-block text-sm text-gray-300">
                    {label}
                    {required && <span className="ml-1 text-red-500">*</span>}
                </label>
            )}
            <select
                defaultValue={defaultOption}
                onChange={(e) => {
                    if (updateState) {
                        updateState(e.target.value)
                    }
                }}
                className="rounded-md bg-white px-2 ring-steel-blue"
            >
                {options.map((option) => (
                    <option key={option}>{option}</option>
                ))}
            </select>
        </div>
    )
}

export default DropDown
