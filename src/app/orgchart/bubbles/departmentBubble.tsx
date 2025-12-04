export default function DepartmentBubble({ name }: { name: string }) {
    return (
        <div className="w-[360px] rounded-r-2xl border-4 border-amber-300 bg-amber-50 p-2 text-black-pearl-dark">
            <p className="text-center text-xl font-extrabold">
                {name.toUpperCase()}
            </p>
        </div>
    )
}
