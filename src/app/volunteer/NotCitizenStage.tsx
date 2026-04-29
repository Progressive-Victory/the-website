import { SupportNote } from '.'

export function NotCitizenStage() {
    return (
        <div className="flex min-h-[200px] max-w-[40vw] flex-col items-center justify-center p-4">
            <p className="mb-3 mt-6 text-center text-lg font-bold text-white">
                Sorry! You have to be a citizen and/or resident of the United
                States to volunteer with Progressive Victory.
            </p>
            <SupportNote />
        </div>
    )
}
