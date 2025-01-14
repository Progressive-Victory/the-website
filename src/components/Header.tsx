"use client";
import { Logo } from "./Logo";
import { Bars3Icon } from "@heroicons/react/24/solid";
import Link from "next/link";
const navitems = [
  {
    name: "Home",
    href: "/",
  },
  {
    name: "About",
    href: "/about",
  },
  {
    name: "Volunteer",
    href: "/volunteer",
  },
  {
    name: "Events",
    href: "/events",
  },
  {
    name: "Merch",
    href: "/merch",
  },
  {
    name: "Contact",
    href: "/contact",
  },
];
export function Header() {
  return (
    <div className="sticky top-0 left-0 right-0 flex flex-row items-center justify-between w-full gap-x-4 px-6 md:px-12 py-4 z-10 bg-steel-blue">
      <div className="flex flex-row items-center justify-start gap-x-4 flex-0">
        <Logo className="w-12 h-12 bg-white p-1 rounded-full" />
      </div>
      <div className="flex flex-row items-center justify-center gap-x-12 cursor-pointer hidden lg:flex w-full">
        {navitems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="text-xl text-white font-bold hover:text-jasper hover:bg-white rounded-full px-2 py-1 transition duration-200 ease-in-out"
          >
            {item.name}
          </Link>
        ))}
      </div>
      <Link
        href="#"
        className="text-xl bg-jasper px-4 py-2 rounded-full text-white font-bold hover:bg-white hover:text-black transition duration-300 ease-in-out hidden lg:block"
      >
        Donate
      </Link>
      <button className="group lg:hidden">
        <Bars3Icon className="w-8 h-8 text-white group-hover:text-jasper transition duration-300 ease-in-out" />
      </button>
    </div>
  );
}
