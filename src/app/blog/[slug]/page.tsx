import { MainLayout } from '@/components/MainLayout'
import { formatDate, getPost } from '../util'
import { HTML } from '@/components/HTML'

export default async function Page({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const slug = (await params).slug
    const data = await getPost(slug)
    const post = data.data.post
    const comments = post.comments.nodes

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
                {comments.length > 0 ? (
                    <>
                        <hr />
                        <section id="comments h-full">
                            <h3 className="mb-1">Comments</h3>
                            <div className="flex flex-col gap-3">
                                {comments.map(
                                    ({ id, content, date, author }) => {
                                        return (
                                            <div key={id}>
                                                <p className="font-bold">
                                                    {author.name}
                                                </p>
                                                <span className="italic text-zinc-500">
                                                    {formatDate(date)}
                                                </span>
                                                <HTML html={content} />
                                            </div>
                                        )
                                    }
                                )}
                            </div>
                        </section>
                    </>
                ) : undefined}
            </div>
        </MainLayout>
    )
}
