'use client'
import { Map } from '@/components/Map'
import { Link } from '../common/Buttons'

export function MapGraphic() {
    return (
        <div className="flex flex-col lg:flex-row items-center justify-center bg-white gap-y-24 px-4 py-12">
            <div className="lg:w-[750px] w-[100%] h-[450px]">
                <Map hideOpenStreetMap disableInteraction />
            </div>
            <div className="flex flex-col items-center justify-center gap-y-4 px-4 sm:w-1/2">
                <h1 className="text-4xl font-bold text-black-pearl-dark text-center">
                    Thousands of{' '}
                    <span className="text-valencia">Volunteers</span>
                    <br /> Across the US
                </h1>
                <p className="text-lg text-black text-center lg:w-1/2">
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
