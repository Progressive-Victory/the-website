"use client";
import BlogCard from "@/components/BlogCard";
import { Header } from "@/components/Header";
import BlogHeader from "./BlogHeader";
import { useEffect, useState } from "react";

type Post = {
  node: {
    title: string;
    excerpt: string;
    slug: string;
    content: string;
    date: string;
    id: string;
  };
};

async function getPosts(): Promise<Post[]> {
  const query = `{
    posts {
      edges {
        node {
              title
              excerpt
              slug
              content
              date
              id
            }
          }
        }
      }`;
  const res = await fetch(`http://progressive-victory-blog.local/graphql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
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
    <div className="bg-steel-blue w-full">
      <Header />
      <div>
        <BlogHeader />
        <div className="bg-[#D4E6F5] p-10">
          <h2 className="text-4xl font-bold text-center p-10">Posts</h2>
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post: any) => (
              <BlogCard
                key={post.node.id}
                title={post.node.title}
                description={post.node.excerpt}
                date={post.node.date}
                image="/images/protestors-ukraine.jpg"
              />
            ))}
            {/* <BlogCard
              title="Is Modern Virginia Too Small?"
              description="Of the many issues hardworking Americans face, this one is often ignored"
              date="2024-09-11"
              image="/images/protestors-ukraine.jpg"
            /> */}
          </div>
        </div>
      </div>
    </div>
  );
}
