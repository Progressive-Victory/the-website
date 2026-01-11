import styles from './volunteer.module.css'

export function SupportNote() {
    return (
        <div className={styles.supportNote}>
            <p className={styles.supportNoteText}>
                <em>
                    If the join form is not working for you, please email us at:
                    support@progress.win
                </em>
            </p>
        </div>
    )
}
