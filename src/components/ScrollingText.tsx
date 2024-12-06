"use client";
import { useState, useEffect, useRef } from "react";

const words: string[] = [
  "Democracy",
  "Activism",
  "Phone Banking",
  "Organizing",
  "Canvasing",
  "Learning",
  "Activating",
  "Victory",
  "Empowerment",
  "Community",
  "Vote",
  "Advocacy",
  "Inclusion",
  "Grassroots",
  "Mobilization",
  "Accountability",
  "Representation",
];

function shuffleArray(array: string[]) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const ScrollingText = ({ index }: { index: number }): JSX.Element => {
  const [shuffledWords, setShuffledWords] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>();
  const positionRef = useRef<number>(0);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  useEffect(() => {
    const shuffled = shuffleArray(words);
    setShuffledWords([...shuffled, ...shuffled]); // Double the words for seamless looping
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      const width = containerRef.current.scrollWidth;
      setContainerWidth(width);
    }
  }, [shuffledWords]);

  useEffect(() => {
    if (!containerWidth) return; // Wait until we have a width

    const speed = 0.5; // pixels per frame
    const isEvenRow = index % 2 === 0;

    // Set the initial position based on direction
    // Even rows: start at 0 and move left (negative)
    // Odd rows: start at -containerWidth/2 and move right (positive)
    positionRef.current = isEvenRow ? 0 : -containerWidth / 2;
    if (containerRef.current) {
      containerRef.current.style.transform = `translateX(${positionRef.current}px)`;
    }

    const animate = () => {
      if (isEvenRow) {
        // Move left
        positionRef.current -= speed;
        // If we've moved half the content off-screen, reset to 0
        if (Math.abs(positionRef.current) >= containerWidth / 2) {
          positionRef.current = 0;
        }
      } else {
        // Move right
        positionRef.current += speed;
        // If we've returned to 0, reset to start position (-containerWidth/2)
        if (positionRef.current >= 0) {
          positionRef.current = -containerWidth / 2;
        }
      }

      if (containerRef.current) {
        containerRef.current.style.transform = `translateX(${positionRef.current}px)`;
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [containerWidth, index]);

  return (
    <div className="relative overflow-hidden w-full h-16 bg-white">
      <div
        ref={containerRef}
        style={{ display: "inline-flex", whiteSpace: "nowrap" }}
      >
        {shuffledWords.map((word, idx) => (
          <span
            key={idx}
            className={`text-5xl font-bold mx-4 whitespace-nowrap ${
              idx % 2 === 0 ? "text-black" : "text-white black-text-outline"
            }`}
            style={{ letterSpacing: "0.15em" }}
          >
            {word}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ScrollingText;
