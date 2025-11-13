'use client'

import {
    CollectInfoStage,
    CompleteStage,
    IOnboardingForm,
    JoiningStage,
    PhoneVerifyStage,
} from '.'
import { MainLayout } from '@/components/layout'
import { IUser } from '@/models/User'
import { OnboardingStage } from '@/util/stage'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'

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

    const user = userQuery.data

    const initialStage = useMemo(() => {
        // Reopen the onboarding form if the user is missing data
        if (
            user?.onboardingStage === OnboardingStage.JOINED &&
            (!user.firstName ||
                !user.lastName ||
                !user.dateOfBirth ||
                !user.zipCode ||
                !user.phoneNumber)
        ) {
            return OnboardingStage.NOT_STARTED
        }

        return user?.onboardingStage ?? OnboardingStage.NOT_STARTED
    }, [user])
    const [currentStage, setCurrentStage] =
        useState<OnboardingStage>(initialStage)

    const handleCollectInfoSuccess = async (form: IOnboardingForm) => {
        await updateUserMutation.mutateAsync({
            firstName: form.firstName,
            lastName: form.lastName,
            phoneNumber: form.phoneNumber,
            zipCode: form.zipCode,
            acceptedAlerts: form.getAlerts,
            dateOfBirth: form.dateOfBirth,
            onboardingStage: OnboardingStage.AWAITING_VERIFY,
        })
        setCurrentStage(OnboardingStage.AWAITING_VERIFY)
    }

    const handlePhoneVerifySuccess = () => {
        setCurrentStage(OnboardingStage.VERIFIED)
    }

    const handleJoinSuccess = () => {
        setIsInServer(true)
        setCurrentStage(OnboardingStage.JOINED)
    }

    const handleReturnToStart = async () => {
        await updateUserMutation.mutateAsync({
            onboardingStage: OnboardingStage.NOT_STARTED,
        })
        setCurrentStage(OnboardingStage.NOT_STARTED)
    }

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
                                onSuccess={(form) =>
                                    void handleCollectInfoSuccess(form)
                                }
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
                                goBack={() => void handleReturnToStart()}
                                onSuccess={handlePhoneVerifySuccess}
                            />
                        )}

                        {currentStage === OnboardingStage.VERIFIED && (
                            <JoiningStage
                                queryClient={queryClient}
                                onSuccess={handleJoinSuccess}
                            />
                        )}

                        {currentStage === OnboardingStage.JOINED ? (
                            <CompleteStage
                                isInServer={isInServer}
                                onRejoin={() =>
                                    setCurrentStage(OnboardingStage.VERIFIED)
                                }
                            />
                        ) : (
                            <div className="text-center text-xs font-bold">
                                <p className="text-yellow-200">
                                    <em>
                                        If the join form is not working for you,
                                        please email us at: support@progress.win
                                    </em>
                                </p>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </MainLayout>
    )
}
