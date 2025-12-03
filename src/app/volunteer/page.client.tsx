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
import { IUser } from '@/models/User'
import { dateService } from '@/services'
import { OnboardingStage } from '@/util/stage'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useState } from 'react'

export interface VolunteerPageProps {
    user: IUser | null
    isInSever: boolean
}

export default function VolunteerPage({
    user: initialUser,
    isInSever: initialIsInServer,
}: VolunteerPageProps) {
    const queryClient = useQueryClient()

    const [isInServer, setIsInServer] = useState(initialIsInServer)

    const userQuery = useQuery({
        queryKey: ['user'],
        async queryFn() {
            initialUser = null

            const response = await fetch('/api/user')
            return (await response.json()) as IUser
        },
        initialData: initialUser,
    })

    const updateUserMutation = useMutation({
        mutationFn: async (obj: Partial<IUser>) => {
            const resp = await fetch('/api/user', {
                method: 'PATCH',
                body: JSON.stringify(obj),
            })

            if (resp.status === 200) {
                const data = (await resp.json()) as IUser
                queryClient.setQueryData(['user'], () => data)
            } else {
                throw new Error()
            }
        },
    })
    const updateUser = updateUserMutation.mutateAsync
    const updateStage = useCallback(
        (onboardingStage: OnboardingStage) =>
            void updateUser({ onboardingStage }),
        [updateUser]
    )

    const user = userQuery.data
    const currentStage = user?.onboardingStage ?? OnboardingStage.NOT_STARTED

    const handleCollectInfoSuccess = (form: IOnboardingForm) => {
        const nextStage =
            (dateService.getAge(form.dateOfBirth) ?? 0 < 18)
                ? OnboardingStage.UNDERAGE
                : OnboardingStage.AWAITING_VERIFY

        void updateUserMutation.mutateAsync({
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
        setIsInServer(true)
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
            user?.onboardingStage === OnboardingStage.JOINED &&
            (!user.firstName ||
                !user.lastName ||
                !user.dateOfBirth ||
                !user.zipCode ||
                !user.phoneNumber)
        ) {
            updateStage(OnboardingStage.NOT_STARTED)
        }
    }, [user, updateStage])

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
                                    firstName: user?.firstName ?? '',
                                    lastName: user?.lastName ?? '',
                                    dateOfBirth: user?.dateOfBirth ?? '',
                                    zipCode: user?.zipCode ?? '',
                                    phoneNumber: user?.phoneNumber ?? '',
                                    getAlerts: user?.acceptedAlerts ?? false,
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
                                phoneNumber={user?.phoneNumber ?? ''}
                                lastSmsCodeSentAt={
                                    user?.lastSmsCodeSentAt
                                        ? new Date(user?.lastSmsCodeSentAt)
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
