import BlogCard from "@/components/BlogCard";
import { Header } from "@/components/Header";

export default function Home() {
  return (
    <div className="bg-steel-blue w-full">
      <Header />
      <div>
        <h1 className="text-3xl md:text-5xl bg-white text-center">
          Progressive Victory Blog
        </h1>
        <div className="bg-[#D4E6F5] p-10">
          <h2 className="text-2xl font-bold text-center p-10">Posts</h2>
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            <BlogCard />
            <BlogCard />
            <BlogCard />
            <BlogCard />
          </div>
        </div>
      </div>
    </div>
  );
}
