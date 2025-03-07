import Image from 'next/image'
import Link from 'next/link'
export function MapGraphic() {
    return (
        <div className="flex flex-col lg:flex-row items-center justify-center bg-white w-full gap-y-24 px-4 py-12">
            <Image
                src="/images/map.png"
                alt="progressive-victory-map"
                className="rounded-md order-last lg:order-first"
                width={500}
                height={500}
            />
            <div className="flex flex-col items-center justify-center gap-y-4 px-4 sm:w-1/2 w-full">
                <h1 className="text-4xl font-bold text-black-pearl-dark text-center">
                    Thousands of{' '}
                    <span className="text-valencia">Volunteers</span>
                    <br /> Across the US
                </h1>
                <p className="text-lg text-black text-center w-full lg:w-1/2">
                    The PV community is constantly growing! Our members are
                    organizing in their local communities, identifying campaigns
                    in their area, and using the shared resources, tactics, and
                    people power of Progressive Victory!
                </p>
                <Link
                    href="/volunteer"
                    className="text-xl bg-valencia px-4 py-2 rounded-full text-white font-bold hover:bg-black-pearl-dark hover:text-white transition duration-300 ease-in-out"
                >
                    Get Involved
                </Link>
            </div>
        </div>
    )
}
