const CTA = ({
    askText,
    buttonText,
}: {
    askText: string
    buttonText: string
}) => {
    return (
        <div className={`bg-black-pearl-light-dark relative w-full shadow-2xl`}>
            <div className="-translate-x-1 translate-y-[-5px] bg-valencia p-4">
                <div className="flex w-full flex-col items-center justify-center gap-y-4">
                    <h1 className="text-center text-4xl font-bold text-white">
                        {askText}
                    </h1>
                    <button className="bg-black px-4 py-2 font-bold text-white hover:bg-white hover:text-black-pearl-dark">
                        {buttonText}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default CTA
