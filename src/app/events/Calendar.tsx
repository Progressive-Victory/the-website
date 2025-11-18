'use client'

import { Frame } from '@/app/events/Frame'
import { useDebounce } from '@uidotdev/usehooks';

export function ClientCalendar({ src }: Readonly<{ src: string }>) {
    // Get client timezone and encode it to use in the URL
    const timezoneParameter: string = useDebounce(
        '&ctz=' + encodeURI(Intl.DateTimeFormat().resolvedOptions().timeZone),
        50
    );
    return (
        <div className="relative flex size-full flex-col items-center gap-y-10 bg-steel-blue p-8">
            <div className="halftone z-1 absolute left-0 top-0 size-full opacity-10" />

            <div className="relative mx-6 w-full rounded-lg bg-[#f0f4f9] py-8">
                <p className="text-center text-3xl font-black text-black-pearl-dark lg:text-5xl">
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
