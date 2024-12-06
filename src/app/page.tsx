import ScrollingBackground from "@/components/ScrollingBackground";
import Header from "@/components/Header";
import CTA from "@/components/CTA";
import Hero from "@/components/Hero";
export default function Home() {
  return (
    <div className="flex flex-col items-center h-screen md:px-6 px-4 py-10 gap-y-8">
      <ScrollingBackground />
      <Header />
      <Hero />
      <CTA askText="Ready to make a difference?" buttonText="Get Involved" />
    </div>
  );
}
