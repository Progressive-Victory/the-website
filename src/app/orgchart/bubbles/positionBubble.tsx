export interface PositionData {
    id: string
    title: string
    name?: string
    acting?: boolean
    redacted?: boolean
    leadership?: string
}

export default function PositionBubble({ data }: { data: PositionData }) {
    function LeadershipBanner() {
        switch (data.leadership) {
            case 'Junior':
                return (
                    <div
                        className={`col-span-1 border-r-2 border-amber-300 bg-blue-300`}
                    />
                )
            case 'Senior':
                return (
                    <div
                        className={`col-span-1 border-r-2 border-amber-300 bg-red-600`}
                    />
                )
            default:
                return <div className="col-span-1" />
        }
    }

    function Nameplate() {
        if (data.redacted) {
            return (
                <p className={`text-base text-red-600`}>CANDIDATE REDACTED</p>
            )
        }
        if (data.name == null) {
            return <p className={`text-base text-red-600`}>UNFILLED</p>
        }
        if (data.acting) {
            return (
                <p className={`text-base text-white`}>
                    {data.name.toUpperCase()}
                    <span className="text-red-600">
                        {' ('}ACTING{')'}
                    </span>
                </p>
            )
        }
        return (
            <p className={`text-base text-white`}>{data.name.toUpperCase()}</p>
        )
    }

    return (
        <div className="grid w-[360px] grid-cols-12 overflow-hidden rounded-2xl border-2 border-amber-300 bg-black-pearl-dark font-bold">
            <LeadershipBanner />
            <div className="col-span-9 p-2">
                <p className="text-sm italic text-amber-300">
                    {data.title?.toUpperCase()}
                </p>
                <Nameplate />
            </div>
            <div className="col-span-2"></div>
        </div>
    )
}
