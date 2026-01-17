import styles from './blog.module.css'
import { BlogCard, BlogHeader, getPosts } from '@/app/blog'
import { MainLayout } from '@/components/layout/MainLayout'

export default async function Home() {
    const data = await getPosts()
    const posts = data.data.posts.edges

    return (
        <MainLayout>
            <BlogHeader />
            <div className={styles.page}>
                <h2 className={styles.title}>Posts</h2>

                <div className={styles.grid}>
                    {posts.map((post) => (
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
