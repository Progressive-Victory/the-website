import DetailPanel from '../detailPanel'

export default function TeamBubble({
    name,
    desc,
}: {
    name: string
    desc?: string
}) {
    function RenderDetails() {
        return <DetailPanel name={name} desc={desc} />
    }

    function DescriptionBox() {
        if (desc == null) return null
        return (
            <div className="border-t-4 border-red-600">
                <p className="py-1 text-sm font-semibold text-black-pearl-dark">
                    {desc.toUpperCase()}
                </p>
            </div>
        )
    }

    return (
        <div
            className="w-[360px] rounded-r-2xl border-4 border-amber-300 bg-amber-50 p-2 text-black-pearl-dark"
            onClick={RenderDetails}
        >
            <p className="text-lg font-extrabold">{name.toUpperCase()}</p>
            {desc == null ? null : <DescriptionBox />}
        </div>
    )
}
