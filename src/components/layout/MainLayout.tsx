import { Footer } from './footer/Footer'
import { Header } from './header/Header'

export function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <div
            style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100dvh', // ALWAYS USE dvh instead of vh or you will glitch viewport in safari on iOS/iPADOS
                width: '100%',
            }}
        >
            <Header />

            <div
                style={{
                    position: 'relative',
                    display: 'flex',
                    flex: 1,
                    flexDirection: 'column',
                    backgroundColor: '#4483C7', // Steel Blue
                }}
            >
                {children}
            </div>
            <Footer />
        </div>
    )
}
