import BlogCard from '@/components/BlogCard'
import { BlogHeader } from '@/components/BlogHeader'
import { MainLayout } from '@/components/MainLayout'
import { getPosts } from './util'

interface Post {
    node: {
        id: string
        date: string
        title: string
        excerpt: string
        content: string
    }
}

export default async function Home() {
    const data = await getPosts()
    const posts = data.data.posts.edges

    return (
        <MainLayout>
            <BlogHeader />
            <div className="bg-[#D4E6F5] p-10">
                <h2 className="p-10 text-center text-4xl font-bold">Posts</h2>
                <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
                    
                    {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                    posts.map((post: Post) => (
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
    )
}
