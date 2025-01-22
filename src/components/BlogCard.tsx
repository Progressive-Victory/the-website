import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function BlogCard() {
  function formatDate(date: string) {
    return new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
  return (
    <Link className="relative rounded-xl shadow-md" href="#">
      <div className="relative w-full overflow-hidden rounded-xl before:absolute before:inset-x-0 before:z-[1] before:size-full before:bg-gradient-to-t before:from-neutral-900/[.9] ">
        <Image
          src="/images/protestors-ukraine.jpg"
          alt="test"
          width={650}
          height={650}
        />
      </div>
      <div className="absolute inset-x-0 bottom-0 z-[1]">
        <div className="flex h-full flex-col rounded-b-xl bg-white bg-opacity-90 p-4 sm:p-6 ">
          <h3 className="text-xl ">Is Modern Virginia Too Small?</h3>
          <p className="text-gray-500">
            Of the many issues hardworking Americans face, this one is often
            ignored
          </p>
          <p className="text-sm">{formatDate("2024-09-11")}</p>
        </div>
      </div>
    </Link>
  );
}
