import styles from '@/components/AccessDenied.module.css'
import { FaBan } from 'react-icons/fa'

export interface AccessDeniedProps {
    message: string
}

export function AccessDenied({ message }: AccessDeniedProps) {
    return (
        <div className={styles.accessDeniedBox}>
            <FaBan className={styles.icon} />
            <h1>Access Denied</h1>
            <p>{message}</p>
        </div>
    )
}
