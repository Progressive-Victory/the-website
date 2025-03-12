'use client'
import { useState } from 'react'
import { PlusIcon, MinusIcon } from '@heroicons/react/24/solid'
function Questions({ question, answer }: { question: string; answer: string }) {
    const [isOpen, setIsOpen] = useState(false)
    return (
        <button
            className="relative overflow-y-scroll flex flex-col items-center justify-center mx-4 gap-y-4 bg-white p-4 rounded-md my-4"
            onClick={() => setIsOpen(!isOpen)}
        >
            <div className="flex flex-row items-center justify-between gap-x-4 w-full mt-4">
                <h1 className="text-2xl font-bold text-black text-left">
                    {question}
                </h1>
                {isOpen ? (
                    <MinusIcon className="w-8 h-8 text-black-pearl-dark" />
                ) : (
                    <PlusIcon className="w-8 h-8 text-black-pearl-dark" />
                )}
            </div>
            <div
                className={`select-text transition-all duration-100 pointer-events-auto text-lg text-black-pearl-dark text-left ${
                    isOpen
                        ? 'max-h-40 pb-4 overflow-auto'
                        : 'max-h-0 overflow-hidden'
                }`}
            >
                {answer}
            </div>
        </button>
    )
}

const questions = [
    {
        question: "What if I'm not from the US?",
        answer: "Hello! We appreciate you! Please join using the regular form and click the 'I'm not from the US' option.",
    },
]

export function FAQ() {
    return (
        <div className="flex flex-col items-center justify-center bg-black-pearl-dark py-12 w-full lg:w-2/3 rounded-lg gap-y-10">
            <h1 className="text-4xl font-bold text-white w-full text-center px-2">
                Frequently <span className="text-valencia">Asked</span>{' '}
                Questions?
            </h1>

            <div className="w-full flex flex-col items-center justify-center gap-x-4">
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
