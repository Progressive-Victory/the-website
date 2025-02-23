import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
export function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen grid grid-rows-[min-content_1fr_min-content]">
            <Header />
            <div>{children}</div>
            <Footer />
        </div>
    )
}
