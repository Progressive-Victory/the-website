import { SupportNote } from '.'
import { useInit } from '@/util/hooks'
import { ArrowPathIcon } from '@heroicons/react/24/solid'

export interface JoiningStageProps {
    isPending: boolean
    error: Error | null
    onJoin: () => void
}

export function JoiningStage({ isPending, error, onJoin }: JoiningStageProps) {
    useInit(() => {
        onJoin()
    })

    return (
        <div>
            <div className="flex min-h-[200px] flex-col items-center justify-center p-4">
                {error ? (
                    <>
                        <p className="font-white text-center text-xl font-bold text-red-400">
                            Error
                        </p>
                        <p className="mx-2 mb-2 max-w-80 text-center text-sm font-medium text-red-400">
                            {error.message}
                        </p>
                        <button
                            type="submit"
                            disabled={isPending}
                            onClick={onJoin}
                            className="my-4 w-full rounded-md bg-steel-blue py-2 text-center text-lg font-bold text-white transition-all duration-100 hover:bg-valencia disabled:cursor-not-allowed disabled:bg-gray-500 [&:not(:disabled)]:hover:scale-[103%]"
                        >
                            Try Again
                        </button>
                    </>
                ) : (
                    <>
                        <ArrowPathIcon className="size-8 animate-spin text-white" />
                        <p className="mt-6 text-center text-lg font-bold text-white">
                            Joining you to the server...
                        </p>
                    </>
                )}
            </div>

            <SupportNote />
        </div>
    )
}
