export default function DepartmentBubble({ name }: { name: string }) {
    return (
        <div className="m-4 w-64 rounded-2xl border-4 border-amber-300 bg-amber-50 p-2">
            <p className="text-center text-xl font-extrabold text-black-pearl-dark">
                {name.toUpperCase()}
                <br />
                DEPARTMENT
            </p>
        </div>
    )
}
