import { MainLayout } from "@/components/MainLayout";
import { getPost, Post } from "../util";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const slug = (await params).slug;
  const data = await getPost(slug);
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
