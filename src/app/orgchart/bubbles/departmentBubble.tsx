export default function DepartmentBubble({ name }: { name: string }) {
    return (
        <div className="w-[360px] rounded-r-2xl border-4 border-amber-300 bg-amber-50 p-1 text-xl">
            <div>
                <p className="text-center text-xl font-extrabold text-black-pearl-dark">
                    {name.toUpperCase()}
                    <br />
                    DEPARTMENT
                </p>
            </div>
        </div>
    )
}
