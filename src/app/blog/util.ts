export interface GraphqlPost {
    post: {
        title: string
        content: string
        date: string
    }
}

export interface GraphqlPosts {
    posts: {
        edges: [
            {
                node: {
                    id: string
                    title: string
                    excerpt: string
                    content: string
                    date: string
                }
            },
        ]
    }
}

export interface GraphqlResponse<T> {
    data: T
    errors?: {
        message: string
        locations?: { line: number; column: number }[]
        path?: string[]
    }[]
}

export function getPosts() {
    const query = `{posts{edges{node{title, excerpt, content, date, id}}}}`
    const result = graphqlQuery<GraphqlPosts>(query)
    return result
}

export function getPost(slug: string) {
    const query = `{post(id:"${slug}"){title, content, date}}`
    return graphqlQuery<GraphqlPost>(query)
}

async function graphqlQuery<T>(query: string) {
    const res = await fetch('https://blog.progressivevictory.win/graphql/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
    })
    return (await res.json()) as GraphqlResponse<T>
}
