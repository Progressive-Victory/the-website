'use client'

import styles from './page.module.css'
import { BlogCard, BlogHeader, getPosts } from '@/app/blog'
import { MainLayout } from '@/components/layout/MainLayout'
import { useQuery } from '@tanstack/react-query'

interface Post {
    node: {
        id: string
        date: string
        title: string
        excerpt: string
        content: string
    }
}

export default function Home() {
    const data = useQuery({ queryKey: ['graphql-posts'], queryFn: getPosts })
    const posts = data.data?.data?.posts?.edges

    if (!posts) return <MainLayout></MainLayout>

    return (
        <MainLayout>
            <BlogHeader />
            <div className={styles.body}>
                <h2 className={styles.title}>Posts</h2>
                <div className={styles.postContainer}>
                    {posts.map((post: Post) => (
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
