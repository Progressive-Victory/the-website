import { getPost } from '../util'
import styles from '@/app/blog/blog.module.css'
import { MainLayout } from '@/components/layout/MainLayout'

export default async function Page({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const slug = (await params).slug
    const data = await getPost(slug)
    const post = data.data.post

    return (
        <MainLayout>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>{post.title}</h1>
                    <p className={styles.date}>
                        {new Date(post.date).toDateString()}
                    </p>
                </div>

                <div
                    className={styles.content}
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />
            </div>
        </MainLayout>
    )
}
