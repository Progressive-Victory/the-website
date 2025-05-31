'use client'
import { Map } from '@/components/Map'
import Link from 'next/link'
export function MapGraphic() {
    return (
        <div className="flex w-full flex-col items-center justify-center gap-y-24 bg-white px-4 py-12 lg:flex-row">
            <div className="h-[450px] w-full lg:w-[750px]">
                <Map hideOpenStreetMap disableInteraction />
            </div>
            <div className="flex w-full flex-col items-center justify-center gap-y-4 px-4 sm:w-1/2">
                <h1 className="text-center text-4xl font-bold text-black-pearl-dark">
                    Thousands of{' '}
                    <span className="text-valencia">Volunteers</span>
                    <br /> Across the US
                </h1>
                <p className="w-full text-center text-lg text-black lg:w-1/2">
                    The PV community is constantly growing! Our members are
                    organizing in their local communities, identifying campaigns
                    in their area, and using the shared resources, tactics, and
                    people power of Progressive Victory!
                </p>
                <Link
                    href="/volunteer"
                    className="rounded-full bg-valencia px-4 py-2 text-xl font-bold text-white transition duration-300 ease-in-out hover:bg-black-pearl-dark hover:text-white"
                >
                    Get Involved
                </Link>
            </div>
        </div>
    )
}
