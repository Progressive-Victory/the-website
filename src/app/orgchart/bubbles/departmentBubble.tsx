import styles from './bubbles.module.css'

export default function DepartmentBubble({ name }: { name: string }) {
    return (
        <div className={styles.yellowBubble}>
            <p>
                {name.toUpperCase()}
            </p>
        </div>
    )
}
