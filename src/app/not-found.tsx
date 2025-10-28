import { MainLayout } from '@/components/layout'
import { Metadata } from 'next'

const infoBlockClassName =
    'my-6 rounded-lg bg-black-pearl-dark pt-6 pb-8 px-8 text-white'

export const metadata: Metadata = {
    title: 'PV - 404',
    description: '404 not found page.',
    openGraph: {
        title: 'PV - 404',
        url: 'https://www.progressivevictory.win/',
        siteName: 'Progressive Victory',
        images: [
            { url: 'https://www.progressivevictory.win/images/banner.png' },
        ],
    },
}

function InfoHeader({ title }: { title: string }) {
    return <p className="mb-4 text-left text-3xl font-black">{title}</p>
}

export default function notFound() {
    return (
        <MainLayout>
            <div className="halftone z-1inset-0 absolute size-full opacity-10" />
            <div className="z-2 min-h-auto relative m-auto flex size-auto flex-col p-10 text-justify tracking-wide lg:max-w-[80%]">
                <div className={infoBlockClassName}>
                    <InfoHeader title="Error 404" />
                    <p>
                        This page does not exist! We appologize for the
                        inconvience.
                    </p>
                </div>
            </div>
        </MainLayout>
    )
}
