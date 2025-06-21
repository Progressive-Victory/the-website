import { MainLayout } from '@/components/layout'
import { getPost } from '../util'
import sanitizeHtml from 'sanitize-html'
export default async function Page({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const slug = (await params).slug
    const data = await getPost(slug)
    const post = data

    let sanitized
    try {
        sanitized = sanitizeHtml(post.content)
    } catch (error) {
        console.error(error)
        sanitized = '<p>Error sanitzing HTML!</p>'
    }

    return (
        <MainLayout>
            <div className="mx-auto h-screen max-w-6xl overflow-y-scroll bg-white px-3 py-10">
                <div className="pb-5">
                    <h1 className="text-4xl font-bold">{post.title}</h1>
                    <p className="text-zinc-500">
                        {new Date(post.date).toDateString()}
                    </p>
                </div>
                <div dangerouslySetInnerHTML={{ __html: sanitized }} />
            </div>
        </MainLayout>
    )
}
