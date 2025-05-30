import { Header } from './Header'
import { Footer } from './Footer'

export function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative h-full w-full">
            <Header />
            <div className="bg-steel-blue">{children}</div>
            <Footer />
        </div>
    )
}
