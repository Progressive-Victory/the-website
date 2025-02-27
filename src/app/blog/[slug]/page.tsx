import { MainLayout } from '@/components/MainLayout'
import { formatDate, getPost } from '../util'
import { HTML } from '@/components/HTML'
import { CommentsList } from '@/components/blog/CommentsList'

export default async function Page({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const slug = (await params).slug
    const data = await getPost(slug)
    const post = data.data.post
    const comments = post.comments.nodes
    const allowAddComment = false

    return (
        <MainLayout>
            <div className="max-w-6xl mx-auto px-3 py-8 grid auto-rows-auto gap-3">
                <section id="post-content">
                    <div className="mb-3">
                        <h1>{post.title}</h1>
                        <p className="text-zinc-500 italic">
                            {formatDate(post.date)}
                        </p>
                    </div>
                    <HTML html={post.content} />
                </section>
                <CommentsList
                    comments={comments}
                    allowAddComment={allowAddComment}
                />
            </div>
        </MainLayout>
    )
}
