"use client";
import { Logo } from "./Logo";
import Link from "next/link";
import { Button } from "./ui/button";
import Hamburger from "./Hamburger";

export function Header() {
  return (
    <header className="sticky top-0 left-0 right-0 w-full p-5 z-10">
      <nav className="flex flex-wrap justify-between gap-1">
        <Link href="/" className="flex items-center pr-2 rounded-md">
          <Logo className="w-12 h-12 p-1 rounded-md" />
          <span className="text-xl font-bold">Progressive Victory</span>
        </Link>
        <div className="flex flex-wrap gap-1 items-center">
          <Link href="#">
            <Button variant="ghost">Donate</Button>
          </Link>
          <Link href="/blog">
            <Button variant="ghost">Blog</Button>
          </Link>
          <Link href="/blog/post">
            <Button variant="ghost">Post</Button>
          </Link>
          <div className="ml-auto mr-5 md:hidden">
            <Hamburger />
          </div>
        </div>
      </nav>
    </header>
  );
}
