"use client";
import { useState } from "react";
import { PlusIcon, MinusIcon } from "@heroicons/react/24/solid";
function Questions({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
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
  );
}

const questions = [
  {
    question: "What is this?",
    answer:
      "Progressive Victory is a non-profit organization that connects people with like-minded individuals who want to make a difference in their communities.",
  },
];

export function FAQ() {
  return (
    <div className="flex flex-col items-center justify-center bg-black py-20 w-full gap-y-24">
      <h1 className="text-4xl font-bold text-white">
        Frequently{" "}
        <span className="relative inline-block">
          <span
            className="absolute top-0 left-0 text-4xl font-bold text-red-800 translate-y-1 translate-x-1"
            style={{ zIndex: 1 }}
          >
            Asked
          </span>
          <span
            className="text-4xl font-bold text-white"
            style={{ zIndex: 2, position: "relative" }}
          >
            Asked
          </span>
        </span>{" "}
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
  );
}
