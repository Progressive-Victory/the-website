'use client'

import { PlusIcon, MinusIcon } from '@heroicons/react/24/solid'
import { useState } from 'react'

const questions = [
    {
        question: "What if I'm not from the US?",
        answer: 'Progressive Victory is a U.S. based organization that is currently not equipped to organize in other countries. Only U.S. citizens and permanent residents are able to join at this time.',
    },
]

export default function FAQ() {
    return (
        <div className="mx-3 flex flex-col items-center justify-center gap-y-8 rounded-lg bg-black-pearl-dark pt-6 pb-10 lg:w-2/3">
            <h1 className="w-full text-center text-4xl font-bold text-white">
                Frequently <span className="text-valencia">Asked</span>{' '}
                Questions?
            </h1>

            <div className="flex w-full flex-col items-center justify-center gap-x-4">
                {questions.map((question) => (
                    <Questions
                        key={question.question}
                        question={question.question}
                        answer={question.answer}
                    />
                ))}
            </div>
        </div>
    )
}

function Questions({ question, answer }: { question: string; answer: string }) {
    const [isOpen, setIsOpen] = useState(false)
    return (
        <button
            className="relative mx-8 flex flex-col items-center justify-center gap-y-4 overflow-y-scroll rounded-md bg-white p-4"
            onClick={() => setIsOpen(!isOpen)}
        >
            <div className="mt-5 flex w-full flex-row items-center justify-between gap-x-4">
                <h1 className="text-left text-2xl font-bold text-black">
                    {question}
                </h1>
                {isOpen ? (
                    <MinusIcon className="size-8 text-black-pearl-dark" />
                ) : (
                    <PlusIcon className="size-8 text-black-pearl-dark" />
                )}
            </div>
            <div
                className={`pointer-events-auto mr-10 select-text text-justify text-lg text-black-pearl-dark transition-all duration-100 ${
                    isOpen
                        ? 'max-h-40 overflow-auto pb-4'
                        : 'max-h-0 overflow-hidden'
                }`}
            >
                {answer}
            </div>
        </button>
    )
}
