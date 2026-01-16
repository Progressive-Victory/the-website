'use client'

import {
    CollectInfoStage,
    CompleteStage,
    IOnboardingForm,
    JoiningStage,
    PhoneVerifyStage,
    UnderageStage,
} from '.'
import { MainLayout } from '@/components/layout'
import {
    DiscordUserIsInServerResponse,
    UserOnboardingCollectInfoRequest,
    UserOnboardingJoinRequest,
    UserOnboardingVerifyRequest,
    zDiscordUserIsInServerResponse,
} from '@/models'
import { useCurrentUser, useFetch } from '@/util/hooks'
import { OnboardingStage } from '@/util/stage'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

export default function VolunteerPage() {
    const session = useSession()
    const { onGet, onPut } = useFetch()

    const queryClient = useQueryClient()

    const [currentStage, setCurrentStage] = useState(
        OnboardingStage.NOT_STARTED
    )

    const user = useCurrentUser()
    const discordUserId = session.data?.discordId

    const isInServerResult = useQuery({
        queryKey: [`/discordUsers/${discordUserId}/isInServer`],
        async queryFn({ signal }) {
            return await onGet<DiscordUserIsInServerResponse>(
                `/discordUsers/${discordUserId}/isInServer`,
                zDiscordUserIsInServerResponse,
                { signal }
            )
        },
    })

    const collectInfoMutation = useMutation({
        mutationFn: async (obj: UserOnboardingCollectInfoRequest) => {
            if (!user.data) return
            await onPut(
                `/users/${user.data?.id}/onboardingStages/collectInfo`,
                obj
            )
            user.reload()
        },
    })

    const ageUpMutation = useMutation({
        mutationFn: async () => {
            if (!user.data) return
            await onPut(`/users/${user.data?.id}/onboardingStages/ageUp`, null)
            user.reload()
        },
    })

    const verifyMutation = useMutation({
        mutationFn: async (obj: UserOnboardingVerifyRequest) => {
            if (!user.data) return
            await onPut(`/users/${user.data?.id}/onboardingStages/verify`, obj)
            user.reload()
        },
    })

    const joinMutation = useMutation({
        mutationFn: async (obj: UserOnboardingJoinRequest) => {
            if (!user.data) return
            await onPut(`/users/${user.data?.id}/onboardingStages/join`, obj)
            user.reload()
        },
    })

    const handleCollectInfoSuccess = (form: IOnboardingForm) => {
        collectInfoMutation.mutate({
            firstName: form.firstName,
            lastName: form.lastName,
            phoneNumber: form.phoneNumber,
            zipCode: +form.zipCode,
            acceptedAlerts: form.getAlerts,
            dateOfBirth: new Date(form.dateOfBirth),
        })
    }

    const handleAgeUp = () => {
        ageUpMutation.mutate()
    }

    const handlePhoneVerifySuccess = () => {
        verifyMutation.mutate({ code: 0 })
    }

    const handleJoin = () => {
        if (!session.data) return
        joinMutation.mutate({ discordUserId: session.data?.discordId })
    }

    const handleReturnToStart = () => {
        setCurrentStage(OnboardingStage.NOT_STARTED)
    }

    useEffect(() => {
        if (
            currentStage === OnboardingStage.JOINED &&
            (!user.data?.firstName ||
                !user.data?.lastName ||
                !user.data?.birthdate ||
                !user.data?.location ||
                !user.data?.phone)
        ) {
            setCurrentStage(OnboardingStage.NOT_STARTED)
        }
    }, [user.data, currentStage])

    useEffect(() => {
        if (user.data?.onboardingStage)
            setCurrentStage(user.data.onboardingStage)
    }, [user.data?.onboardingStage])

    if (!user.data) return <MainLayout />

    return (
        <MainLayout>
            <div className="relative flex min-h-screen flex-col items-center justify-center bg-steel-blue">
                <div className="halftone z-1 absolute left-0 top-0 size-full opacity-10" />
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
                                        user.data?.birthdate?.toISOString() ??
                                        '',
                                    zipCode:
                                        user.data?.location?.zip.toString() ??
                                        '',
                                    phoneNumber: user.data?.phone ?? '',
                                    getAlerts:
                                        user.data?.acceptedAlerts ?? false,
                                    usCitizen: false,
                                    privacyPolicy: false,
                                }}
                                isPending={collectInfoMutation.isPending}
                                onSuccess={handleCollectInfoSuccess}
                            />
                        )}

                        {currentStage === OnboardingStage.UNDERAGE && (
                            <UnderageStage
                                isPending={ageUpMutation.isPending}
                                onAgeUp={handleAgeUp}
                            />
                        )}

                        {currentStage === OnboardingStage.AWAITING_VERIFY && (
                            <PhoneVerifyStage
                                queryClient={queryClient}
                                phoneNumber={user.data?.phone ?? ''}
                                lastSmsCodeSentAt={
                                    user.data?.lastSmsCodeSendTimeUtc
                                }
                                isPending={verifyMutation.isPending}
                                goBack={handleReturnToStart}
                                onSuccess={handlePhoneVerifySuccess}
                            />
                        )}

                        {(currentStage === OnboardingStage.VERIFIED ||
                            (currentStage === OnboardingStage.JOINED &&
                                isInServerResult.isLoading)) && (
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
                                        isInServerResult.data?.isInServer
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
