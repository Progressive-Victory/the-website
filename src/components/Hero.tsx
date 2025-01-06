"use client";
import { motion } from "framer-motion";
import { Message } from "./Message";

export function Hero() {
  return (
    <div className="relative h-fit bg-steel-blue w-full flex flex-col items-center justify-start overflow-hidden py-20">
      {/* Animated Main Text */}
      <motion.div
        className="text-center w-1/2"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <h1 className="text-4xl font-bold text-white">
          Welcome to{" "}
          <span className="relative inline-block">
            <span
              className="absolute top-0 left-0 text-4xl font-bold text-blue-900 translate-y-1 translate-x-1"
              style={{ zIndex: 1 }}
            >
              Progressive Victory
            </span>
            <span
              className="text-4xl font-bold text-white"
              style={{ zIndex: 2, position: "relative" }}
            >
              Progressive Victory
            </span>
          </span>{" "}
          the Online Community for Political Action.
        </h1>

        <p className="text-lg text-white mt-4">
          Find like minded people, share ideas, and engage in meaningful
          political action. Get involved today!
        </p>
      </motion.div>

      {/* Message Blocks */}
      <div className="mt-20 flex flex-wrap justify-center gap-6">
        <motion.div
          initial={{ rotate: -10, y: 50, opacity: 0 }}
          animate={{ rotate: -5, y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        >
          <Message
            avatar="https://picsum.photos/200"
            username="John Doe"
            nameColor="red"
            text="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
          />
        </motion.div>
        <motion.div
          initial={{ rotate: 10, y: 50, opacity: 0 }}
          animate={{ rotate: 5, y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
        >
          <Message
            avatar="https://picsum.photos/201"
            username="Jane Smith"
            nameColor="blue"
            text="Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
          />
        </motion.div>
        <motion.div
          initial={{ rotate: -15, y: 50, opacity: 0 }}
          animate={{ rotate: -8, y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.6 }}
        >
          <Message
            avatar="https://picsum.photos/202"
            username="Alice Johnson"
            nameColor="green"
            text="Ut enim ad minim veniam, quis nostrud exercitation ullamco."
          />
        </motion.div>
        <motion.div
          initial={{ rotate: 15, y: 50, opacity: 0 }}
          animate={{ rotate: 8, y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.8 }}
        >
          <Message
            avatar="https://picsum.photos/203"
            username="Bob Brown"
            nameColor="purple"
            text="Duis aute irure dolor in reprehenderit in voluptate velit."
          />
        </motion.div>
        <motion.div
          initial={{ rotate: 22, y: 50, opacity: 0 }}
          animate={{ rotate: -10, y: 5, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.8 }}
        >
          <Message
            avatar="https://picsum.photos/203"
            username="Bob Brown"
            nameColor="purple"
            text="Duis aute irure dolor in reprehenderit in voluptate velit."
          />
        </motion.div>
      </div>
    </div>
  );
}
