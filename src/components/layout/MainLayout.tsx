import { Header } from './Header'
import { Footer } from './Footer'

export function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative flex size-full min-h-screen flex-col">
            <Header />
            <div className="relative bg-steel-blue flex-1">{children}</div>
            <Footer />
        </div>
    )
}
