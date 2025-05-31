'use client'

import { Frame } from '@/components/Frame'

export function ClientCalendar({ src }: Readonly<{ src: string }>) {
    // Get client timezone and encode it to use in the URL
    const timezoneParameter: string =
        '&ctz=' + encodeURI(Intl.DateTimeFormat().resolvedOptions().timeZone)
    return (
        <div className="relative flex h-full w-full flex-col items-center gap-y-10 bg-steel-blue p-4">
            <div className="halftone z-1 absolute left-0 top-0 h-full w-full opacity-10" />

            <div className="relative mx-6 w-full rounded-lg bg-[#f0f4f9] py-4">
                <p className="text-center text-3xl font-black lg:text-5xl">
                    Progressive Victory Calendar
                </p>
                <Frame
                    src={src + timezoneParameter}
                    className="mx-auto mt-4 h-[800px] w-[95%] bg-[#f0f4f9]"
                    type="calendar"
                    title="Calendar"
                >
                    Loading…
                </Frame>
            </div>
        </div>
    )
}
