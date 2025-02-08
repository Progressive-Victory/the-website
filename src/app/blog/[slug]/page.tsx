import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BlogHeader } from "@/components/BlogHeader";
import { MainLayout } from "@/components/MainLayout";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const slug = (await params).slug;
  const res = await fetch(`http://progressive-victory-blog.local/graphql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `{post(id:"${slug}"){title, content, date}}`,
    }),
  });
  const data = await res.json();
  const post = data.data.post;

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-3 py-10">
        <div className="pb-5">
          <h1 className="text-4xl font-bold">{post.title}</h1>
          <p className="text-zinc-500">{new Date(post.date).toDateString()}</p>
        </div>
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </div>
    </MainLayout>
  );
}
