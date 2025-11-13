import PositionData from '../types/positionData'
import Image from 'next/image'

export default function PositionBubble({
    data,
    mini,
}: {
    data: PositionData
    mini?: boolean
}) {
    const LeadershipBanner = () => {
        switch (data.leadership) {
            case 'Junior':
                return (
                    <div
                        className={`col-span-1 border-r-2 border-amber-300 bg-blue-400`}
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

    const Nameplate = () => {
        if (data.redacted) {
            return (
                <p className={`${mini ? 'text-sm' : 'text-base'} text-red-600`}>
                    CANDIDATE REDACTED
                </p>
            )
        }
        if (data.name == null) {
            return (
                <p className={`${mini ? 'text-sm' : 'text-base'} text-red-600`}>
                    UNFILLED
                </p>
            )
        }
        if (data.acting) {
            return (
                <p className={`${mini ? 'text-sm' : 'text-base'} text-white`}>
                    {data.name.toUpperCase()}
                    <span className="text-red-600">
                        {' ('}ACTING{')'}
                    </span>
                </p>
            )
        }
        return (
            <p className={`${mini ? 'text-sm' : 'text-base'} text-white`}>
                {data.name.toUpperCase()}
            </p>
        )
    }

    const Committees = () => {
        return (
            <div className="col-span-1 flex flex-col justify-center">
                {data.committees?.map((committee) => {
                    return (
                        <div
                            key={committee.name}
                            className={`flex ${mini ? 'h-[17px]' : 'h-[20px]'} justify-center`}
                        >
                            <Image
                                src={committee.icon}
                                alt={committee.alt}
                                width={mini ? 17 : 20}
                                height={mini ? 17 : 20}
                            />
                        </div>
                    )
                })}
            </div>
        )
    }

    return (
        <div
            className={`grid ${mini ? 'w-[290px]' : 'w-[360px]'} grid-cols-12 overflow-hidden rounded-2xl border-2 border-amber-300 bg-black-pearl-dark font-bold`}
        >
            <LeadershipBanner />
            <div
                className={`${data.committees ? 'col-span-10' : 'col-span-11'} p-2`}
            >
                <p
                    className={`${mini ? 'text-xs' : 'text-sm'} italic text-amber-300`}
                >
                    {data.title != null
                        ? data.title?.toUpperCase()
                        : 'VOLUNTEER'}
                </p>
                <Nameplate />
            </div>
            {data.committees ? <Committees /> : null}
        </div>
    )
}
