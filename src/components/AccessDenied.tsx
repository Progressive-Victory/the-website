import styles from '@/components/AccessDenied.module.css'

export interface AccessDeniedProps {
    message: string
}

export function AccessDenied({ message }: AccessDeniedProps) {
    return (
        <div className={styles.accessDeniedBox}>
            <h1>Access Denied</h1>
            <p>{message}</p>
        </div>
    )
}
