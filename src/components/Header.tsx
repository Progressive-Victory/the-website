"use client";
import Container from "./Container";
import Logo from "./Logo";
import Link from "next/link";
import { useState } from "react";
import { Bars3Icon, ChevronDownIcon } from "@heroicons/react/16/solid";

const items = [
  { name: "Home", href: "/", subLinks: [] },
  { name: "About", href: "/", subLinks: [] },
  {
    name: "Get Involved",
    href: "#",
    subLinks: [
      { name: "Volunteer", href: "/volunteer" },
      { name: "Events", href: "/events" },
    ],
  },
  {
    name: "Resources",
    href: "#",
    subLinks: [
      { name: "Check Voter Status", href: "/check-vote" },
      { name: "Register to Vote", href: "/register-vote" },
      { name: "Request Mail in Ballot", href: "/request-mail" },
      { name: "Pledge to Vote", href: "/pledge-vote" },
      { name: "Election Reminder", href: "/election-reminder" },
      { name: "Where to Vote", href: "/where-to-vote" },
    ],
  },
  { name: "Hub", href: "#", subLinks: [] },
  { name: "Merch", href: "#", subLinks: [] },
  { name: "Contact", href: "#", subLinks: [] },
];

const Header = () => {
  const [showSublinks, setShowSublinks] = useState<string>("");
  return (
    <Container className="w-full z-10">
      <div className="flex flex-row items-center justify-between w-full sm:px-4 px-2">
        <Logo className="h-20 p-1" />
        <div className="md:flex flex-row items-center justify-center hidden">
          {items.map((item, index) => {
            if (item.subLinks.length > 0) {
              return (
                <button
                  onClick={() => setShowSublinks(item.name)}
                  onMouseLeave={() => setShowSublinks("")}
                  key={index}
                  className="relative flex flex-row items-center justify-center py-4 px-6 text-white hover:bg-white hover:text-black font-bold"
                >
                  {item.name}
                  <ChevronDownIcon className="h-8 w-8" />
                  {showSublinks === item.name && (
                    <div className="absolute top-16 left-0 bg-white w-full z-10 shadow-2xl">
                      {item.subLinks.map((subItem, index) => (
                        <Link key={index} href={subItem.href}>
                          <div
                            key={index}
                            className="py-4 px-6 text-black hover:bg-black hover:text-white"
                          >
                            {subItem.name}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </button>
              );
            } else {
              return (
                <Link key={index} href={item.href}>
                  <div
                    key={index}
                    className="py-4 px-6 text-white hover:bg-white hover:text-black font-bold"
                  >
                    {item.name}
                  </div>
                </Link>
              );
            }
          })}
        </div>
        <button className="md:flex hidden bg-jasper py-4 px-4 text-white hover:bg-white hover:text-black font-bold">
          Donate
        </button>
        <Bars3Icon className="md:hidden flex h-8 p-1 text-white hover:text-black" />
      </div>
    </Container>
  );
};

export default Header;
