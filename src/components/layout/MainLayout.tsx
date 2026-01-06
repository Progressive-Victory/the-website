import { Footer } from './Footer'
import { Header } from './Header'

export function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative flex size-full min-h-screen flex-col">
            <Header />
            <div className="relative flex flex-1 flex-col bg-steel-blue">
                {children}
            </div>
            <Footer />
        </div>
    )
}
