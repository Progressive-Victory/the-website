"use client";
import { Logo } from "./Logo";
import Link from "next/link";
import Hamburger from "./Hamburger";
import { Button } from "./ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

export function Header() {
  return (
    <header className="sticky top-0 left-0 right-0 w-full p-5 z-10">
      <nav className="flex flex-wrap justify-between gap-1 items-center">
        <Link href="/" className="flex items-center pr-2 rounded-md">
          <Logo className="w-12 h-12 p-1 rounded-md" />
          <span className="text-xl font-bold">Progressive Victory</span>
        </Link>
        <div className="flex flex-wrap gap-1 items-center max-sm:hidden">
          <Link href="#">
            <Button variant="ghost">Donate</Button>
          </Link>
          <Link href="/blog">
            <Button variant="ghost">Blog</Button>
          </Link>
          <Link href="/blog/post">
            <Button variant="ghost">Post</Button>
          </Link>
        </div>
        <div className="sm:hidden">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>
                  <Hamburger />
                </NavigationMenuTrigger>
                <NavigationMenuContent className="grid gap-1 *:p-2 ">
                  <Link href="/" className="hover:bg-gray-100">
                    Donate
                  </Link>
                  <Link href="/blog" className="hover:bg-gray-100">
                    Blog
                  </Link>
                  <Link href="/blog/post" className="hover:bg-gray-100">
                    Post
                  </Link>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </nav>
    </header>
  );
}
