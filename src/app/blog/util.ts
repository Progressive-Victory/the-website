export interface Post {
    node: {
        id: string
        date: string
        title: string
        excerpt: string
        content: string
    }
}

export interface PostData {
    data: {
        posts: {
            edges: Post[]
        }
    }
}

const HEADLESS_WORDPRESS_SANDBOX_URL =
    'https://blog.progressivevictory.win/?graphql=true'

export async function getPosts(): Promise<PostData> {
    const query = `query{posts{edges{node{title, excerpt, content, date, id}}}}`
    const res = await fetch(HEADLESS_WORDPRESS_SANDBOX_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
    })
    const data = (await res.json()) as PostData

    return data
}

export async function getPost(
    slug: string
): Promise<{ title: string; content: string; date: string }> {
    const query = `{post(id:"${slug}"){title, content, date}}`
    const res = await fetch(HEADLESS_WORDPRESS_SANDBOX_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
    })
    const data = (await res.json()) as {
        data: { post: { title: string; content: string; date: string } }
    }
    return data.data.post
}
