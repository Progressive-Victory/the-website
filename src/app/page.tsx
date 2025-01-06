import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Volunteer } from "@/components/Volunteer";
export default function Home() {
  return (
    <div className="bg-steel-blue w-full">
      <Header />
      <div className="flex flex-col items-center z-1">
        <Hero />
        <Volunteer />
      </div>
    </div>
  );
}
