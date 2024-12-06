"use client";
import { useState, useEffect } from "react";
import ScrollingText from "./ScrollingText";
const ScrollingBackground = () => {
  const [numberOfRows, setNumberOfRows] = useState(20);
  const resizeHandler = () => {
    const pageHeight = window.innerHeight;
    const numRows = Math.ceil(pageHeight / 48);
    setNumberOfRows(numRows);
  };
  useEffect(() => {
    // Get page height
    const pageHeight = window.innerHeight;
    // Calculate number of rows based on page height
    const numRows = Math.ceil(pageHeight / 48);
    setNumberOfRows(numRows);

    // Add event listener for window resize
    window.addEventListener("resize", resizeHandler);
    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener("resize", resizeHandler);
    };
  }, []);

  return (
    <div className="absolute top-0 left-0 w-full flex flex-col items-center justify-center gap-y-2">
      {[...Array(numberOfRows)].map((_, index) => (
        <ScrollingText key={index} index={index} />
      ))}
    </div>
  );
};
export default ScrollingBackground;
