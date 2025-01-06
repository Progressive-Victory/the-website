"use client";
import { Logo } from "./Logo";
import Link from "next/link";
export function Header() {
  return (
    <div className="sticky top-0 left-0 right-0 flex flex-row items-center justify-between w-full gap-x-4 px-12 py-4 z-10 bg-steel-blue">
      <div className="flex flex-row items-center justify-start gap-x-4">
        <Logo className="w-12 h-12 bg-white p-1 rounded-full" />
        <h1 className="text-2xl font-bold text-white">Progressive Victory</h1>
      </div>
      <Link
        href="#"
        className="text-xl bg-jasper px-4 py-2 rounded-full text-white font-bold hover:bg-white hover:text-black transition duration-300 ease-in-out"
      >
        Donate
      </Link>
    </div>
  );
}
