import { useInit } from '@/util/hooks'

interface BannedStageProps {
    isPending: boolean
    onUnban: () => void
}

// TODO: tailwind dep
export function BannedStage({ isPending, onUnban }: BannedStageProps) {
    useInit(() => onUnban())

    return (
        <div
            className="flex min-h-[200px] max-w-[40vw] flex-col items-center justify-center gap-4 p-4"
            style={{ marginBottom: 30 + 'px' }}
        >
            <p className="mb-3 mt-6 text-center text-lg font-bold text-white">
                You have been banned from the Discord server. You can appeal by
                reaching out to:{' '}
                <a
                    href="mailto:community@progress.win"
                    className="text-steel-blue"
                >
                    community@progress.win
                </a>
            </p>
            <button
                disabled={isPending}
                onClick={onUnban}
                className="flex w-fit items-center whitespace-nowrap rounded-lg bg-steel-blue px-4 py-3 text-center text-sm text-white transition-all duration-100 disabled:cursor-not-allowed [&:not(:disabled)]:hover:scale-[103%]"
            >
                Check again
            </button>
        </div>
    )
}
