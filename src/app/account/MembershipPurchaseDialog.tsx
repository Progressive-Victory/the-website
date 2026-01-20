import Image from 'next/image'

const MembershipPurchaseDialog = () => {
    return (
        <div className="flex flex-col justify-center gap-8">
            <Image
                src="/images/membercard_front.png"
                alt="Front content"
                width={480}
                height={302}
                className="rounded-lg"
                priority
                quality={100}
                unoptimized
            />
            <div className="flex flex-row justify-center">
                <button
                    className="rounded-md bg-steel-blue p-2 text-lg font-bold text-white transition-all duration-100 hover:bg-valencia "
                    type="button"
                    onClick={() => {
                        console.log('quan')
                    }}
                >
                    Become a Member!
                </button>
            </div>
        </div>
    )
}

export default MembershipPurchaseDialog
