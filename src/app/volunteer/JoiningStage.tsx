import { SupportNote } from '.'
import { useInit } from '@/hooks'
import { ArrowPathIcon } from '@heroicons/react/24/solid'
import { QueryClient, useMutation } from '@tanstack/react-query'
import { signOut } from 'next-auth/react'

export interface JoiningStageProps {
    queryClient: QueryClient
    onSuccess: () => void
}

export function JoiningStage({ queryClient, onSuccess }: JoiningStageProps) {
    const joinToServerMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch('/api/onboarding/discord/join', {
                method: 'POST',
            })

            if (res.ok) {
                await queryClient.invalidateQueries({ queryKey: ['user'] })
                onSuccess()
            } else {
                try {
                    // Not every response will have JSON but errors should
                    const data = (await res.json()) as { code: string }

                    console.error('Failed to join server:', res)

                    if (data.code === 'INVALID_OAUTH2_ACCESS_CODE') {
                        await signOut({
                            callbackUrl: '/login',
                        })
                    } else if (data.code === 'DISCORD_EMAIL_NOT_VERIFIED') {
                        throw new Error(
                            'Your Discord email is not verified! Please verify it and then try again.'
                        )
                    }

                    throw new Error(
                        data.code ??
                            'An unknown error occurred. Please try again or contact the email below if the issue persists'
                    )
                } catch (e) {
                    console.error('Failed to parse join server response:', e)
                    throw new Error(
                        'Failed to join Discord server (unknown error)'
                    )
                }
            }
        },
    })

    useInit(() => {
        joinToServerMutation.mutate()
    })

    return (
        <div>
            <div className="flex min-h-[200px] flex-col items-center justify-center p-4">
                {joinToServerMutation.isError ? (
                    <>
                        <p className="font-white text-center text-xl font-bold text-red-400">
                            Error
                        </p>
                        <p className="mx-2 mb-2 max-w-80 text-center text-sm font-medium text-red-400">
                            {joinToServerMutation.error.message}
                        </p>
                        <button
                            type="submit"
                            onClick={() => joinToServerMutation.mutate()}
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
