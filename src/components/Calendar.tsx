'use client'

import { Frame } from '@/components/Frame'
import { MainLayout } from '@/components/MainLayout'

export function ClientCalendar({ children }: Readonly<{children: string}>) {
    // Get client timezone and encode it to use in the URL
    const timezoneParameter: string = "&ctz=" + encodeURI(Intl.DateTimeFormat().resolvedOptions().timeZone);
    return (
            <MainLayout>
                <div className="bg-steel-blue w-full h-full flex flex-col items-center p-4 gap-y-10">
                    <div className="w-full bg-[#f0f4f9] rounded-lg py-4 mx-6">
                        <p className="text-center text-3xl font-black lg:text-5xl">
                            Progressive Victory Calendar
                        </p>
                        <Frame
                            src={children + timezoneParameter}
                            className="mx-auto h-[800px] mt-4 w-[95%] bg-[#f0f4f9]"
                            type="calendar"
                            title="Calendar"
                        >
                            Loading…
                        </Frame>
                    </div>
                </div>
            </MainLayout>
        )
}