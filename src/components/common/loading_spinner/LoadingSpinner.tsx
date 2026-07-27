'use client'

import styles from './loadingSpinner.module.css'
import { FaCircleNotch } from 'react-icons/fa6'

export default function LoadingSpinner() {
    return (
        <div className={styles.loadingSpinnerContainer}>
            <FaCircleNotch className={styles.loadingSpinner} size={64} />
        </div>
    )
}
