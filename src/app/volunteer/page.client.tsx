'use client'

import { CollectInfoStage, IOnboardingForm } from './CollectInfoStage'
import { CompleteStage } from './CompleteStage'
import { JoiningStage } from './JoiningStage'
import { PhoneVerifyStage } from './PhoneVerifyStage'
import { UnderageStage } from './UnderageStage'
import { MainLayout } from '@/components/layout'
import { useDiscordMember, useUser } from '@/hooks'
import { dateService } from '@/services'
import { OnboardingStage } from '@/util/stage'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect } from 'react'

export default function VolunteerPage() {
    const queryClient = useQueryClient()

    const user = useUser()
    const discordUser = useDiscordMember()

    const updateStage = useCallback(
        (onboardingStage: OnboardingStage) =>
            void user.onUpdate({ onboardingStage }),
        [user]
    )

    const currentStage = user.data?.onboardingStage

    const handleCollectInfoSuccess = (form: IOnboardingForm) => {
        const nextStage =
            (dateService.getAge(form.dateOfBirth) ?? 0 < 18)
                ? OnboardingStage.UNDERAGE
                : OnboardingStage.AWAITING_VERIFY

        user.onUpdate({
            firstName: form.firstName,
            lastName: form.lastName,
            phoneNumber: form.phoneNumber,
            zipCode: form.zipCode,
            acceptedAlerts: form.getAlerts,
            dateOfBirth: form.dateOfBirth,
            onboardingStage: nextStage,
        })
    }

    const handleAgeUp = () => {
        updateStage(OnboardingStage.AWAITING_VERIFY)
    }

    const handlePhoneVerifySuccess = () => {
        updateStage(OnboardingStage.VERIFIED)
    }

    const handleJoinSuccess = () => {
        updateStage(OnboardingStage.JOINED)
    }

    const handleReturnToStart = () => {
        updateStage(OnboardingStage.NOT_STARTED)
    }

    const handleRejoin = () => {
        updateStage(OnboardingStage.VERIFIED)
    }

    useEffect(() => {
        if (
            !isLoading &&
            onboardingStage === OnboardingStage.JOINED &&
            (!user.data.firstName ||
                !user.data.lastName ||
                !user.data.dateOfBirth ||
                !user.data.zipCode ||
                !user.data.phoneNumber)
        ) {
            updateStage(OnboardingStage.NOT_STARTED)
        }
    }, [user.data, updateStage])

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
                                    dateOfBirth: user.data?.dateOfBirth ?? '',
                                    zipCode: user.data?.zipCode ?? '',
                                    phoneNumber: user.data?.phoneNumber ?? '',
                                    getAlerts:
                                        user.data?.acceptedAlerts ?? false,
                                    usCitizen: false,
                                    privacyPolicy: false,
                                }}
                                onSuccess={handleCollectInfoSuccess}
                            />
                        )}

                        {currentStage === OnboardingStage.UNDERAGE && (
                            <UnderageStage
                                dateOfBirth={user?.dateOfBirth}
                                onAgeUp={handleAgeUp}
                            />
                        )}

                        {currentStage === OnboardingStage.AWAITING_VERIFY && (
                            <PhoneVerifyStage
                                queryClient={queryClient}
                                phoneNumber={user.data?.phoneNumber ?? ''}
                                lastSmsCodeSentAt={
                                    user.data?.lastSmsCodeSentAt
                                        ? new Date(user.data?.lastSmsCodeSentAt)
                                        : null
                                }
                                goBack={handleReturnToStart}
                                onSuccess={handlePhoneVerifySuccess}
                            />
                        )}

                        {currentStage === OnboardingStage.VERIFIED && (
                            <JoiningStage
                                queryClient={queryClient}
                                onSuccess={handleJoinSuccess}
                            />
                        )}

                        {currentStage === OnboardingStage.JOINED && (
                            <CompleteStage
                                isInServer={isInServer}
                                onRejoin={handleRejoin}
                            />
                        )}
                    </form>
                </div>
            </div>
        </MainLayout>
    )
}
