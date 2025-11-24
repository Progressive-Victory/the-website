'use client'
import { MainLayout } from '@/components/layout'
import OrgChartApp from './app'

export default function OrgChart() {
    return (
        <MainLayout>
            {/* Halftone background */}
            <div className="halftone z-1 absolute inset-0 size-full opacity-10" />
            <div className="z-2 relative m-auto flex min-h-screen w-full flex-col items-center justify-start gap-y-10 pb-16 pt-10 xl:min-h-[unset]">
                <header className="w-full text-center text-4xl font-bold text-white">
                    {'Organization '}
                    <span className="text-black-pearl-dark">{'Chart'}</span>
                </header>
                <div className="h-[75vh] w-[97vw] overflow-auto rounded-lg bg-black-pearl-dark p-2">
                    <OrgChartApp />
                </div>
            </div>
        </MainLayout>
    )
}
