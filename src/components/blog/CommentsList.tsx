import { Comment } from './Comment'

type CommentsListProps = {
    comments: Array<{
        id: string
        content: string
        date: string
        author: {
            name: string
        }
    }>
    allowAddComment?: boolean
}

export function CommentsList({
    comments,
    allowAddComment = false,
}: CommentsListProps) {
    if (comments.length === 0) {
        return null
    }

    return (
        <>
            <hr />
            <section id="comments h-full">
                <h3 className="mb-1">Comments</h3>
                {allowAddComment && (
                    <div className="flex items-end flex-col">
                        <textarea className="w-full border border-black rounded-sm" />
                        <button>Submit</button>
                    </div>
                )}

                <div className="flex flex-col gap-3">
                    {comments.map((comment) => (
                        <Comment key={comment.id} {...comment} />
                    ))}
                </div>
            </section>
        </>
    )
}
