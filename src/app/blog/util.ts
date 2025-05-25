const HEADLESS_WORDPRESS_SANDBOX_URL =
    'https://bpheadlessb110.wpenginepowered.com/graphql'

export function getPosts() {
    const query = `{posts{edges{node{title, excerpt, content, date, id}}}}`
    return graphqlQuery(query)
}

export function getPost(slug: string) {
    const query = `{post(id:"${slug}"){title, content, date}}`
    return graphqlQuery(query)
}

async function graphqlQuery(query: string) {
    const res = await fetch(HEADLESS_WORDPRESS_SANDBOX_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
    })
    
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return res.json()
}
