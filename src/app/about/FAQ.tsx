'use client'
import { useState } from 'react'
import { PlusIcon, MinusIcon } from '@heroicons/react/24/solid'

const questions = [
    {
        question: "What if I'm not from the US?",
        answer: "Hello! We appreciate you! Please join using the regular form and click the 'I'm not from the US' option.",
    },
]

export default function FAQ() {
    return (
        <div className="mx-3 flex flex-col items-center justify-center gap-y-10 rounded-lg bg-black-pearl-dark py-12 lg:w-2/3">
            <h1 className="w-full px-2 text-center text-4xl font-bold text-white">
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
            className="relative m-4 flex flex-col items-center justify-center gap-y-4 overflow-y-scroll rounded-md bg-white p-4"
            onClick={() => setIsOpen(!isOpen)}
        >
            <div className="mt-4 flex w-full flex-row items-center justify-between gap-x-4">
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
                className={`pointer-events-auto select-text text-left text-lg text-black-pearl-dark transition-all duration-100 ${
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
