import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
export function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative w-full h-full">
            <Header />
            {children}
            <Footer />
        </div>
    )
}
