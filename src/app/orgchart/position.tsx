export default function PositionBubble({
    title,
    name,
    leadership,
    committees,
}: {
    title: string
    name?: string
    leadership?: string
    committees?: string[]
}) {
    /*      */
    function LeadershipBanner() {
        switch (leadership) {
            case 'Junior':
                return (
                    <div className="w-3 border-r-2 border-amber-300 bg-black-pearl-dark" />
                )
            case 'Senior':
                return (
                    <div className="w-3 border-r-2 border-amber-300 bg-red-600" />
                )
            default:
                return <div className="w-3" />
        }
    }

    function Committees() {
        return committees?.map(AddCommittee)
    }

    function AddCommittee(committee: string) {
        return <p className="text-xs text-white">[{committee.toUpperCase()}]</p>
    }

    function Nameplate() {
        if (name == null) {
            return <p className="text-md text-red-600">UNFILLED</p>
        }
        return <p className="text-md text-white">{name.toUpperCase()}</p>
    }

    return (
        <div className="m-4 flex w-64 grid-cols-10 flex-row rounded-r-2xl border-2 border-amber-300 bg-black-pearl-dark font-bold">
            <LeadershipBanner />
            <div className="p-2">
                <p className="text-sm italic text-amber-300">
                    {title.toUpperCase()}
                </p>
                <Committees />
                <Nameplate />
            </div>
        </div>
    )
}
