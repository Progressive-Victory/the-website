import { Header } from './Header'
import { Footer } from './Footer'

export function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative w-full h-full">
            <Header />
            <div className="bg-steel-blue">
                {children}
            </div>
            <Footer />
        </div>
    )
}
