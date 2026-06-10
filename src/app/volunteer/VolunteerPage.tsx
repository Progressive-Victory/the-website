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
import { NotCitizenStage } from './NotCitizenStage'
import { HalftoneBackground } from '@/components/halftone/HalftoneBackground'
import { MainLayout } from '@/components/layout'
import { OnboardingStage } from '@/contracts/data'
import {
    UserOnboardingCollectInfoRequest,
    UserOnboardingVerifyRequest,
    zUserOnboardingCollectInfoRequest,
} from '@/contracts/requests'
import {
    DiscordUserIsInServerResponse,
    zDiscordUserIsInServerResponse,
} from '@/contracts/responses'
import { useAuth, useCurrentUser, useFetch } from '@/util/hooks'
import {
    keepPreviousData,
    skipToken,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import z from 'zod'

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
                      onGet<DiscordUserIsInServerResponse>(
                          `/discordUsers/${discordUserId}/isInServer`,
                          zDiscordUserIsInServerResponse,
                          { signal }
                      )
                : skipToken,
        placeholderData: keepPreviousData,
    })

    const collectInfoMutation = useMutation({
        mutationFn: async (obj: UserOnboardingCollectInfoRequest) => {
            if (!user.data) return
            await onPut(
                `/users/${user.data?.id}/onboardingStages/collectInfo`,
                z.parse(zUserOnboardingCollectInfoRequest, {
                    ...obj,
                    metaData: {
                        dataSource: 'Intake Form',
                    },
                } satisfies UserOnboardingCollectInfoRequest)
            )
        },
        onSettled: () => {
            setOverrideStage(null)
            return queryClient.invalidateQueries({
                queryKey: ['/users/current'],
            })
        },
    })

    const ageUpMutation = useMutation({
        mutationFn: async () => {
            if (!user.data) return
            await onPut(`/users/${user.data?.id}/onboardingStages/ageUp`, null)
        },
        onSettled: () => {
            setOverrideStage(null)
            return queryClient.invalidateQueries({
                queryKey: ['/users/current'],
            })
        },
    })

    const sendSmsCodeMutation = useMutation({
        mutationFn: async () => {
            if (!user.data) return
            await onPost(
                `/users/${user.data?.id}/onboardingStages/sendVerificationCode`,
                null,
                null
            )
        },
        onSettled: () => {
            setOverrideStage(null)
            return queryClient.invalidateQueries({
                queryKey: ['/users/current'],
            })
        },
    })

    const verifyMutation = useMutation({
        mutationFn: async (obj: UserOnboardingVerifyRequest) => {
            if (!user.data) return
            await onPut(`/users/${user.data?.id}/onboardingStages/verify`, obj)
        },
        onSettled: () => {
            setOverrideStage(null)
            return Promise.all([
                queryClient.invalidateQueries({ queryKey: ['/users/current'] }),
                queryClient.invalidateQueries({
                    queryKey: [`/discordUsers/${discordUserId}/isInServer`],
                }),
            ])
        },
    })

    const joinMutation = useMutation({
        mutationFn: async () => {
            if (!user.data) return
            await onPost(
                `/users/${user.data?.id}/onboardingStages/join`,
                null,
                null
            )
        },
        onSettled: () =>
            queryClient.invalidateQueries({ queryKey: ['/users/current'] }),
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

    useEffect(() => {
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
    }, [user.data, currentStage])

    if (isSessionLoading) return null

    if (!session) {
        window.location.href = '/login?redirect=/volunteer'
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

                        {currentStage === OnboardingStage.NOT_CITIZEN && (
                            <NotCitizenStage />
                        )}

                        {currentStage === OnboardingStage.BANNED && (
                            <BannedStage />
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
