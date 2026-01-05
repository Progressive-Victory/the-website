import DropDown from '@/components/common/DropDown'
import { useState } from 'react'

interface pronounConfiguration {
    subject: string
    object: string
}

const PronounSelection = ({
    setSelectedPronouns,
    setSelectedSubjectPronoun,
    setSelectedObjectPronoun,
}: {
    setSelectedPronouns: (selectedPronouns: string) => void
    setSelectedSubjectPronoun: (selectedSubjectPronoun: string) => void
    setSelectedObjectPronoun: (selectedObjectPronoun: string) => void
}) => {
    const otherPronounOption = 'other'
    const noPreferencePronounConfiguration = {
        subject: 'any',
        object: 'all',
    }
    const pronounConfiguration: pronounConfiguration[] = [
        {
            subject: 'they',
            object: 'them',
        },
        {
            subject: 'she',
            object: 'her',
        },
        {
            subject: 'he',
            object: 'him',
        },
    ]

    const initialPronounOptions = [
        ...pronounConfiguration.map(
            (element) => `${element.subject}/${element.object}`
        ),
        ...[
            `${noPreferencePronounConfiguration.subject}/${noPreferencePronounConfiguration.object}`,
        ],
        ...[otherPronounOption],
    ]
    const subjectPronouns = pronounConfiguration
        .map((element) => [element.subject, element.object])
        .flat()
        .concat(noPreferencePronounConfiguration.subject)
    const objectPronouns = pronounConfiguration
        .map((element) => [element.subject, element.object])
        .flat()
        .concat(noPreferencePronounConfiguration.object)

    const [selectedPronounOption, setSelectedPronounOption] =
        useState('they/them')

    return (
        <div>
            <section className="flex flex-col gap-2 sm:flex-row">
                <DropDown
                    label="Pronouns"
                    options={initialPronounOptions}
                    updateState={(selectedOption: string) => {
                        setSelectedPronounOption(selectedOption)

                        if (selectedOption == otherPronounOption) {
                            setSelectedPronouns('they/them')
                        } else {
                            setSelectedPronouns('they/them')
                        }
                    }}
                    required
                />
            </section>
            {selectedPronounOption == otherPronounOption && (
                <div>
                    <section className="flex flex-col gap-2 sm:flex-row">
                        <DropDown
                            options={subjectPronouns}
                            required
                            updateState={(selectedOption: string) => {
                                setSelectedSubjectPronoun(selectedOption)
                            }}
                        />
                        <label className="mb-[3px] inline-block text-lg text-gray-300">
                            {'/'}
                        </label>
                        <DropDown
                            options={objectPronouns}
                            required
                            updateState={(selectedOption: string) => {
                                setSelectedObjectPronoun(selectedOption)
                            }}
                        />
                    </section>
                </div>
            )}
        </div>
    )
}

export default PronounSelection
