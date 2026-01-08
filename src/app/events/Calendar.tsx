'use client'

import { Frame } from '@/app/events/Frame'
import { HalftoneBackground } from '@/components/halftone/HalftoneBackground'
import { useHydration } from '@/util/hooks'
import { Suspense } from 'react'

export function ClientCalendar({ src }: Readonly<{ src: string }>) {
    const hydrated = useHydration()

    // Get client timezone and encode it to use in the URL
    const timezoneParameter: string =
        '&ctz=' + encodeURI(Intl.DateTimeFormat().resolvedOptions().timeZone)

    return (
        <div className="relative flex size-full flex-col items-center gap-y-10 bg-steel-blue p-8">
            <HalftoneBackground />

            <div className="relative mx-6 w-full rounded-lg bg-[#f0f4f9] py-8">
                <p className="text-center text-3xl font-black text-black-pearl-dark lg:text-5xl">
                    Progressive Victory Calendar
                </p>
                <Suspense key={hydrated ? 'local' : 'utc'}>
                    <Frame
                        src={src + timezoneParameter}
                        className="mx-auto mt-4 h-[800px] w-[95%] bg-[#f0f4f9]"
                        type="calendar"
                        title="Calendar"
                    >
                        Loading…
                    </Frame>
                </Suspense>
            </div>
        </div>
    )
}
