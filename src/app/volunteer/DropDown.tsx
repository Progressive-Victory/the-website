const DropDown = ({
    title,
    options,
    required,
}: {
    title: string
    options: string[]
    required?: boolean
}) => {
    return (
        <div className="flex w-full flex-col items-start justify-center">
            <label className="mb-[3px] inline-block text-sm text-gray-300">
                {title}
                {required && <span className="ml-1 text-red-500">*</span>}
            </label>
            <select>
                {options.map((option) => (
                    <option key={option}>{option}</option>
                ))}
            </select>
        </div>
    )
}

export default DropDown
