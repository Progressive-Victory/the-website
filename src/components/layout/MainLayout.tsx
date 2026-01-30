import { Footer } from './Footer'
import { Header } from './Header'
import styles from './MainLayout.module.css'

export function MainLayout({ children }: { children?: React.ReactNode }) {
    return (
        <div className={styles.content}>
            <Header />

            <div className={styles.children}>{children}</div>

            <Footer />
        </div>
    )
}
