'use client'
import { useState } from 'react'
import { PlusIcon, MinusIcon } from '@heroicons/react/24/solid'
function Questions({ question, answer }: { question: string; answer: string }) {
    const [isOpen, setIsOpen] = useState(false)
    return (
        <button
            className="flex flex-col items-center justify-center w-2/3 gap-y-4 bg-white p-4 rounded-md my-4"
            onClick={() => setIsOpen(!isOpen)}
        >
            <div className="flex flex-row items-center justify-between gap-x-4 w-full">
                <h1 className="text-2xl font-bold text-black text-center">
                    {question}
                </h1>
                {isOpen ? (
                    <MinusIcon className="w-8 h-8 text-black" />
                ) : (
                    <PlusIcon className="w-8 h-8 text-black" />
                )}
            </div>
            {isOpen && <p className="text-lg text-black text-left">{answer}</p>}
        </button>
    )
}

const questions = [
    {
        question: "What if I'm not from the US?",
        answer: `Hello! We appreciate you! We're working on better ways to accommodate you and get everyone plugged in. We are blown away by how quickly this worldwide community has grown - thank you for your patience! If you want to fill out the form to volunteer, please put “00000” in the zip code field on the form. For the immediate future, no international campaigns are in the works.`,
    },
]

export function FAQ() {
    return (
        <div className="flex flex-col items-center justify-center bg-black-pearl-light py-12 w-full lg:w-2/3 rounded-lg gap-y-10">
            <h1 className="text-4xl font-bold text-white">
                Frequently <span className="text-valencia">Asked</span>{' '}
                Questions?
            </h1>

            <div className="w-full flex flex-col items-center justify-center gap-x-10 px-4">
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
