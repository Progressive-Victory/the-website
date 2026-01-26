import Image from 'next/image'
import styles from './membershipPurchaseDialog.module.css'

const MembershipPurchaseDialog = () => {
    return (
        <div className={styles.containerDiv}>
			<div className={styles.imageDiv}>
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
			</div>
            <div className={styles.buttonDiv}>
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
