import { useInit } from '@/util/hooks'

export interface NotCitizenStageProps {
    isPending: boolean
}

export function NotCitizenStage({ isPending }: NotCitizenProps) {
    return (
        <div className="flex min-h-[200px] max-w-[40vw] flex-col items-center justify-center p-4">
            <CalendarIcon className="size-12 text-steel-blue" />
            <p className="mb-3 mt-6 text-center text-lg font-bold text-white">
                Sorry! You have to be a citizen and/or resident of the United
                States to volunteer with Progressive Victory.
            </p>
            <button
                disabled={isPending}
                onClick={onAgeUp}
                className="flex w-fit items-center whitespace-nowrap rounded-lg bg-steel-blue px-4 py-3 text-center text-sm text-white transition-all duration-100 disabled:cursor-not-allowed [&:not(:disabled)]:hover:scale-[103%]"
            >
                Check again
            </button>
        </div>
    )
}
