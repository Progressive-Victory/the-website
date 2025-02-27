const HEADLESS_WORDPRESS_SANDBOX_URL = process.env.WORDPRESS_URI!

export interface Comment {
    id: string
    author: {
        name: string
    }
    date: string
    content: string
    parentId?: string
}

export interface Post {
    id: string
    title: string
    content: string
    date: string
    comments: {
        nodes: Comment[]
    }
}

export function formatDate(date: string) {
    return new Date(date).toDateString()
}

export async function getPosts() {
    const query = `{posts{edges{node{title, excerpt, content, date, id}}}}`
    return await graphqlQuery(query)
}

export async function getPost(slug: string) {
    const query = `{post(id:"${slug}"){title, content, date,  comments(first: 100){nodes{id, author { name }, date, content, parentId}}}}`
    return (await graphqlQuery(query)) as { data: { post: Omit<Post, 'id'> } }
}

async function graphqlQuery(query: string) {
    const res = await fetch(HEADLESS_WORDPRESS_SANDBOX_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
    })
    const data = await res.json()
    return data
}
