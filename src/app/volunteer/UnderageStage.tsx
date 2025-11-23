import { useInit } from '@/hooks'
import { dateService } from '@/services'
import { CalendarIcon } from '@heroicons/react/24/solid'

export interface UnderageStageProps {
    dateOfBirth: string | undefined
    onAgeUp: () => void
}

export function UnderageStage({ dateOfBirth, onAgeUp }: UnderageStageProps) {
    useInit(() => {
        const age = dateService.getAge(dateOfBirth ?? '') ?? 0
        if (age >= 18) onAgeUp()
    })

    return (
        <div className="flex min-h-[200px] max-w-[40vw] flex-col items-center justify-center p-4">
            <CalendarIcon className="size-12 text-steel-blue" />
            <p className="mt-6 text-center text-lg font-bold text-white">
                Sorry! You have to be 18 years old or older to volunteer with
                Progressive Victory.
            </p>
        </div>
    )
}
