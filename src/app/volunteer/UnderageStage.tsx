import { CalendarIcon } from '@heroicons/react/24/solid'

export interface UnderageStageProps {
    isPending: boolean
    onAgeUp: () => void
}

export function UnderageStage({ isPending, onAgeUp }: UnderageStageProps) {
    return (
        <div className="flex min-h-[200px] max-w-[40vw] flex-col items-center justify-center p-4">
            <CalendarIcon className="size-12 text-steel-blue" />
            <p className="mt-6 text-center text-lg font-bold text-white">
                Sorry! You have to be 18 years old or older to volunteer with
                Progressive Victory.
            </p>
            <button disabled={isPending} onClick={onAgeUp}>
                Check again
            </button>
        </div>
    )
}
