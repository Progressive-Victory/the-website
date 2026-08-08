'use client'

import {
    CollectInfoStage,
    CompleteStage,
    IOnboardingForm,
    JoiningStage,
    PhoneVerifyStage,
    UnderageStage,
} from '.'
import { BannedStage } from './BannedStage'
import { HalftoneBackground } from '@/components/halftone/HalftoneBackground'
import { MainLayout } from '@/components/layout'
import { OnboardingStage } from '@/contracts/data'
import {
    UserOnboardingCollectInfoRequest,
    UserOnboardingVerifyRequest,
} from '@/contracts/requests'
import { zDiscordUserIsInServerResponse } from '@/contracts/responses'
import { useAuth, useCurrentUser, useFetch } from '@/util/hooks'
import {
    keepPreviousData,
    skipToken,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query'
import { useState } from 'react'

export default function VolunteerPage() {
    const queryClient = useQueryClient()
    const { isSessionLoading, session } = useAuth()
    const { ready, onGet, onPost, onPut } = useFetch()

    const [overrideStage, setOverrideStage] = useState<OnboardingStage | null>(
        null
    )

    const user = useCurrentUser()
    const discordUserId = session?.discordUserId ?? null

    const isInServerResult = useQuery({
        queryKey: [`/discordUsers/${discordUserId}/isInServer`],
        queryFn:
            ready && discordUserId != null
                ? ({ signal }) =>
                      onGet(
                          '/discordUsers/:discordUserId/isInServer',
                          zDiscordUserIsInServerResponse,
                          { params: { discordUserId }, signal }
                      )
                : skipToken,
        placeholderData: keepPreviousData,
    })

    const collectInfoMutation = useMutation({
        mutationFn: async (obj: UserOnboardingCollectInfoRequest) => {
            if (!user.data) return

            await onPut(
                '/users/:userId/onboardingStages/collectInfo',
                {
                    ...obj,
                    metaData: { dataSource: 'Intake Form' },
                } satisfies UserOnboardingCollectInfoRequest,
                null,
                { params: { userId: user.data?.id } }
            )
        },
        onSettled: async () => {
            setOverrideStage(null)
            await user.onInvalidate()
        },
    })

    const ageUpMutation = useMutation({
        mutationFn: async () => {
            if (!user.data) return
            await onPut('/users/:userId/onboardingStages/ageUp', null, null, {
                params: { userId: user.data?.id },
            })
        },
        onSettled: async () => {
            setOverrideStage(null)
            await user.onInvalidate()
        },
    })

    const unbanMutation = useMutation({
        mutationFn: async () => {
            if (!user.data) return
            await onPut('/users/:userId/onboardingStages/unban', null, null, {
                params: { userId: user.data?.id },
            })
        },
        onSettled: async () => {
            setOverrideStage(null)
            await user.onInvalidate()
        },
    })

    const sendSmsCodeMutation = useMutation({
        mutationFn: async () => {
            if (!user.data) return
            await onPost(
                '/users/:userId/onboardingStages/sendVerificationCode',
                null,
                null,
                { params: { userId: user.data?.id } }
            )
        },
        onSettled: async () => {
            setOverrideStage(null)
            await user.onInvalidate()
        },
    })

    const verifyMutation = useMutation({
        mutationFn: async (obj: UserOnboardingVerifyRequest) => {
            if (!user.data) return
            await onPut('/users/:userId/onboardingStages/verify', obj, null, {
                params: { userId: user.data?.id },
            })
        },
        onSettled: async () => {
            setOverrideStage(null)
            await Promise.all([
                user.onInvalidate(),
                queryClient.invalidateQueries({
                    queryKey: [`/discordUsers/${discordUserId}/isInServer`],
                }),
            ])
        },
    })

    const joinMutation = useMutation({
        mutationFn: async () => {
            if (!user.data) return
            await onPost('/users/:userId/onboardingStages/join', null, null, {
                params: { userId: user.data?.id },
            })
        },
        onSettled: async () => {
            await user.onInvalidate()
        },
    })

    const handleCollectInfoSuccess = (form: IOnboardingForm) => {
        collectInfoMutation.mutate({
            firstName: form.firstName,
            lastName: form.lastName,
            phone: form.phoneNumber,
            zipCode: +form.zipCode,
            acceptedAlerts: form.getAlerts,
            birthdate: new Date(form.dateOfBirth),
            usCitizen: form.usCitizen,
        })
    }

    const handleVerifySmsCode = (code: number) => {
        verifyMutation.mutate({ code })
    }

    const handleJoin = () => {
        if (!session) return
        joinMutation.mutate()
    }

    const handleReturnToStart = () => {
        setOverrideStage(OnboardingStage.NOT_STARTED)
    }

    const currentStage = overrideStage ?? user.data?.onboardingStage

    if (
        currentStage === OnboardingStage.JOINED &&
        (!user.data?.firstName ||
            !user.data?.lastName ||
            !user.data?.birthdate ||
            !user.data?.address?.zip ||
            !user.data?.phone)
    ) {
        setOverrideStage(OnboardingStage.NOT_STARTED)
    }

    if (isSessionLoading) return null

    if (!session) {
        window.location.replace('/login?redirect=/volunteer')
        return null
    }

    if (!user.data) return <MainLayout />

    return (
        <MainLayout>
            <div className="relative flex min-h-screen flex-col items-center justify-center">
                <div
                    className="absolute right-0 top-0 size-full lg:w-1/2 lg:translate-x-1/2"
                    style={{
                        backgroundImage: "url('/images/blend_test.png')",
                        backgroundSize: 'cover',
                        backgroundPosition: 'right',
                        mixBlendMode: 'lighten',
                        transform: 'scaleX(-1)',
                    }}
                />
                <HalftoneBackground />
                <div className="flex w-full justify-center">
                    <form
                        onSubmit={(e) => e.preventDefault()}
                        className="z-0 m-4 flex h-auto flex-col gap-y-4 rounded-lg bg-black-pearl-dark p-4 shadow-md md:m-8 md:p-6"
                    >
                        {currentStage === OnboardingStage.NOT_STARTED && (
                            <CollectInfoStage
                                initialForm={{
                                    firstName: user.data?.firstName ?? '',
                                    lastName: user.data?.lastName ?? '',
                                    dateOfBirth:
                                        user.data?.birthdate
                                            ?.toISOString()
                                            ?.split('T')?.[0] ?? '',
                                    zipCode: user.data?.address?.zip ?? '',
                                    phoneNumber: user.data?.phone ?? '',
                                    getAlerts:
                                        user.data?.acceptedAlerts ?? false,
                                    usCitizen: false,
                                    privacyPolicy: false,
                                    oneTimePasscode: false,
                                }}
                                isPending={collectInfoMutation.isPending}
                                onSubmit={handleCollectInfoSuccess}
                            />
                        )}

                        {currentStage === OnboardingStage.UNDERAGE && (
                            <UnderageStage
                                isPending={ageUpMutation.isPending}
                                onAgeUp={ageUpMutation.mutate}
                            />
                        )}

                        {currentStage === OnboardingStage.BANNED && (
                            <BannedStage
                                isPending={unbanMutation.isPending}
                                onUnban={unbanMutation.mutate}
                            />
                        )}

                        {currentStage === OnboardingStage.AWAITING_VERIFY && (
                            <PhoneVerifyStage
                                lastSmsCodeSendTimeUtc={
                                    user.data?.lastSmsCodeSendTimeUtc
                                }
                                requestIsPending={sendSmsCodeMutation.isPending}
                                verifyIsPending={verifyMutation.isPending}
                                verifyError={verifyMutation.error}
                                onReturn={handleReturnToStart}
                                onRequest={sendSmsCodeMutation.mutate}
                                onVerify={handleVerifySmsCode}
                                onCancelVerify={verifyMutation.reset}
                            />
                        )}

                        {currentStage === OnboardingStage.VERIFIED && (
                            <JoiningStage
                                isPending={
                                    joinMutation.isPending ||
                                    isInServerResult.isLoading
                                }
                                error={joinMutation.error}
                                onJoin={handleJoin}
                            />
                        )}

                        {currentStage === OnboardingStage.JOINED &&
                            isInServerResult.data && (
                                <CompleteStage
                                    isInServer={
                                        isInServerResult.data.isInServer
                                    }
                                    isPending={joinMutation.isPending}
                                    onRejoin={handleJoin}
                                />
                            )}
                    </form>
                </div>
            </div>
        </MainLayout>
    )
}
