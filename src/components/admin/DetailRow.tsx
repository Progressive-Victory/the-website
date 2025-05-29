'use client'

export interface IDetailProps {
    label: string
    doDiv?: boolean
    tgtKey: string
    tgt?: object
}

export default function DetailRow(
    { 
        label, 
        doDiv=true, 
        tgtKey, 
        tgt 
    } : IDetailProps) 
    {
    const key = tgtKey as keyof typeof tgt
    let tgtValue
    if (tgt) tgtValue = tgt[key] as string
    else tgtValue = null
    return (
        <div className={`flex flex-col md:grid md:grid-cols-3 gap-2 md:gap-4 py-2 ${doDiv ? "border-b" : ""}`}>
            <span className="font-medium text-gray-700 text-sm md:text-base">{label}</span>
            <span className="col-span-2 text-gray-600 text-sm md:text-base break-words">
                {tgtValue || 'N/A'}
            </span>
        </div>
    )
}