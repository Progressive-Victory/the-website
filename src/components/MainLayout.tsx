import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
export function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative size-full">
            <Header />
            {children}
            <Footer />
        </div>
    )
}
