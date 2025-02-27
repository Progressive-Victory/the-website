import { HTML } from '@/components/HTML'
import { formatDate } from '@/app/blog/util'

type CommentProps = {
    id: string
    content: string
    date: string
    author: {
        name: string
    }
}

export function Comment({ content, date, author }: CommentProps) {
    return (
        <div>
            <p className="font-bold">{author.name}</p>
            <span className="italic text-zinc-500">{formatDate(date)}</span>
            <HTML html={content} />
        </div>
    )
}
