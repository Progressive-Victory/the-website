'use client'
import { Map } from '@/components/Map'
import { Link } from '@/components/common'

export function MapGraphic() {
    return (
        <div className="flex w-full flex-col items-center justify-center gap-y-24 bg-white px-4 py-12 lg:flex-row">
            <div className="h-[450px] w-[100%] lg:w-[750px]">
                <Map hideOpenStreetMap disableInteraction />
            </div>
            <div className="flex flex-col items-center justify-center gap-y-4 px-4 sm:w-1/2">
                <h1 className="text-center text-4xl font-bold text-black-pearl-dark">
                    Thousands of{' '}
                    <span className="text-valencia">Volunteers</span>
                    <br /> Across the US
                </h1>
                <p className="text-center text-lg text-black lg:w-1/2">
                    The PV community is constantly growing! Our members are
                    organizing in their local communities, identifying campaigns
                    in their area, and using the shared resources, tactics, and
                    people power of Progressive Victory!
                </p>
                <Link href="/volunteer" className="bg-valencia">
                    Get Involved
                </Link>
            </div>
        </div>
    )
}
