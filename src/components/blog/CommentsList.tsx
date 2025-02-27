import { Comment } from './Comment'

type CommentsListProps = {
    comments?: Array<{
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
    if (!allowAddComment && !comments?.length) return

    return (
        <>
            <hr />
            <section id="comments h-full">
                <h3 className="mb-1 font-semibold text-2xl">Comments</h3>
                {allowAddComment && (
                    <div className="flex items-end flex-col">
                        <textarea className="w-full border border-black rounded-sm mb-1" />
                        <button className="border rounded-full px-3 py-1 bg-valencia hover:bg-valencia/70 text-white font-semibold">
                            Submit
                        </button>
                    </div>
                )}
                <div className="flex flex-col gap-3">
                    {comments
                        ? comments.map((comment) => (
                              <Comment key={comment.id} {...comment} />
                          ))
                        : undefined}
                </div>
            </section>
        </>
    )
}
