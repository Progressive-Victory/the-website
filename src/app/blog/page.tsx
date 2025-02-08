"use client";
import BlogCard from "@/components/BlogCard";
import { BlogHeader } from "@/components/BlogHeader";
import { useEffect, useState } from "react";
import { MainLayout } from "@/components/MainLayout";

type Post = {
  node: {
    id: string;
    date: string;
    title: string;
    excerpt: string;
    content: string;
  };
};

async function getPosts(): Promise<Post[]> {
  const res = await fetch(`http://progressive-victory-blog.local/graphql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `{posts{edges{node{title, excerpt, content, date, id}}}}`,
    }),
  });
  const data = await res.json();
  const posts = data.data.posts.edges;
  return posts;
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    async function fetchPosts() {
      const posts = await getPosts();
      console.log(posts);
      setPosts(posts);
    }
    fetchPosts();
  }, []);

  return (
    <MainLayout>
      <BlogHeader />
      <div className="bg-[#D4E6F5] p-10">
        <h2 className="text-4xl font-bold text-center p-10">Posts</h2>
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post: any) => (
            <BlogCard
              key={post.node.id}
              id={post.node.id}
              title={post.node.title}
              description={post.node.excerpt}
              date={post.node.date}
              image="/images/protestors-ukraine.jpg"
            />
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
