import React from "react";
import { Logo } from "@/components/Logo";

export default function BlogHeader() {
  function DoubleTextEffect(
    text: string = "Test",
    upperColor: string = "#09223a",
    lowerColor: string = "#4483C7"
  ) {
    const words = text.split(" ");
    return (
      <div aria-label={text}>
        {words.map((word, index) => (
          <div key={index} className="inline-block relative">
            <span
              className="tracking-wide absolute bottom-0.5 right-0.5"
              style={{ color: upperColor }}
            >
              {word}
            </span>
            <span className="tracking-wide" style={{ color: lowerColor }}>
              {word}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white grid grid-cols-2 py-5">
      <div className="grid text-2xl sm:text-4xl md:text-5xl lg:text-6xl text-right content-center font-extrabold text-[#09223a]">
        {DoubleTextEffect("Progressive".toUpperCase())}
        {DoubleTextEffect("Victory".toUpperCase())}
        {DoubleTextEffect("Blog".toUpperCase(), "#4483C7", "#09223a")}
      </div>
      <div className="inline-block relative w-40 sm:w-50 md:w-60 lg:w-70">
        <Logo className="absolute bottom-1 left-1" />
        <Logo pColor="#4483C7" />
      </div>
    </div>
  );
}
