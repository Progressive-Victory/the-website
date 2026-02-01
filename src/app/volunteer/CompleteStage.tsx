import { CakeIcon, TrophyIcon } from '@heroicons/react/24/solid'

export interface CompleteStageProps {
    isInServer: boolean
    isPending: boolean
    onRejoin: () => void
}

export function CompleteStage({
    isInServer,
    isPending,
    onRejoin,
}: CompleteStageProps) {
    return (
        <div className="flex min-h-[200px] flex-col items-center justify-center p-4">
            {!isInServer ? (
                <>
                    <TrophyIcon className="size-12 text-steel-blue" />
                    <p className="mt-6 text-center text-lg font-bold text-white">
                        Looks like you&apos;re no longer in the server!
                    </p>
                    <p className="my-2 text-center text-sm text-white">
                        Click the button below to rejoin.
                    </p>
                    <button
                        disabled={isPending}
                        onClick={onRejoin}
                        className="mt-2 rounded-full bg-valencia px-4 py-2 font-bold text-white hover:bg-red-900"
                    >
                        Rejoin
                    </button>
                </>
            ) : (
                <>
                    <CakeIcon className="size-12 text-steel-blue" />
                    <p className="mt-6 text-center text-lg font-bold text-white">
                        Congrats, you are in the server!
                    </p>
                    <p className="mt-6 text-center text-sm text-white">
                        Check your Discord client to start participating in the
                        community.
                    </p>
                </>
            )}
        </div>
    )
}
