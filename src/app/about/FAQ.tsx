'use client'

import { ContentSection } from '@/components/ContentSections'

const questions = [
    {
        question: "What if I'm not from the US?",
        answer: 'Progressive Victory is a U.S. based organization that is currently not equipped to organize in other countries. Only U.S. citizens and permanent residents are able to join at this time.',
    },
    {
        question: "What if I'm under the age of 18?",
        answer: 'Unfortunately, all members of Progressive Victory must be 18 years or older in order to join. If you are currently between the ages 16 and 17, you may attend in person organizing or community events if accompanied by a parent or gaurdian.',
    },
    {
        question: "Should I join if I don't want to volunteer?",
        answer: "Of Course! Progressive Victory is more than just a poltical org it's a community first and foremost. We have worked hard to create a healthy & thriving social space for that also happens to swing elections!",
    },
    {
        question: 'Do I need previous organizing experience?',
        answer: 'No! Progressive Victory welcomes newcomers. Many of our most dedicated organizers started with no prior experience. We provide all necessary training and guidance.',
    },
]

export default function FAQ() {
    return (
        <ContentSection
            title="Frequently Asked Questions?"
            highlight="Asked"
            titleAlign="center"
            bodyType="dropdown"
            dropdownItems={questions}
        />
    )
}
