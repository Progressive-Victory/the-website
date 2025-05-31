import { Header } from './Header'
import { Footer } from './Footer'

export function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative size-full">
            <Header />
            <div className="relative bg-steel-blue">{children}</div>
            <Footer />
        </div>
    )
}
