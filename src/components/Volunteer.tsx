"use client";
import Image from "next/image";
import { motion } from "motion/react";
function Card({
  image,
  title,
  description,
  delay = 0,
}: {
  image: string;
  title: string;
  description: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }} // Start position: off-screen to the right
      animate={{ x: 0, opacity: 1 }} // End position: visible and on-screen
      transition={{
        duration: 1.0,
        delay,
        ease: "easeOut",
      }}
      className="flex flex-col items-center justify-start w-[330px] h-[500px] p-4 bg-white rounded-md shadow-xl gap-y-4"
    >
      <Image
        src={image}
        alt={title}
        className="w-32 h-32 rounded-full"
        width={64}
        height={64}
      />
      <h1 className="text-2xl font-bold text-black text-center">{title}</h1>
      <p className="text-lg text-black text-center">{description}</p>
    </motion.div>
  );
}

const actions = [
  {
    image: "/images/Halftone-Handshake.webp",
    title: "Relational Organizing",
    description:
      "Even if we already vote in every election, we all know people who don’t. Making sure our friends and family understand the importance of engaged citizenship is our first responsibility, and we’ve got resources to help make those conversations easy.",
  },
  {
    image: "/images/Halftone-Phone.webp",
    title: "Canvassing & Phonebanking",
    description:
      "To voters in key races. We’re reaching out to identify supporters, offer voting resources, and mobilize supporters. Action is the key to creating Progressive Victories!",
  },
  {
    image: "/images/Halftone-Clipboard.webp",
    title: "Active Learning",
    description:
      "What goes into creating a progressive victory and how to achieve them yourself! We’re teaching volunteers the skills needed to effectively organize and achieve a political project goal.",
  },
];

export function Volunteer() {
  return (
    <div className="flex flex-col items-center justify-center bg-red-500 py-20 w-full gap-y-24">
      <motion.div
        className="text-center w-1/2"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <h1 className="text-4xl font-bold text-white">
          What Can{" "}
          <span className="relative inline-block">
            <span
              className="absolute top-0 left-0 text-4xl font-bold text-blue-900 translate-y-1 translate-x-1"
              style={{ zIndex: 1 }}
            >
              You
            </span>
            <span
              className="text-4xl font-bold text-white"
              style={{ zIndex: 2, position: "relative" }}
            >
              You
            </span>
          </span>{" "}
          Do?
        </h1>
      </motion.div>
      <div className="w-full flex flex-row flex-wrap items-center justify-center gap-10">
        {actions.map((action, index) => (
          <Card
            key={action.title}
            image={action.image}
            title={action.title}
            delay={index * 0.5}
            description={action.description}
          />
        ))}
      </div>
    </div>
  );
}
