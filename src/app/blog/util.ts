
export function getPosts() {
  const query = `{posts{edges{node{title, excerpt, content, date, id}}}}`
  const result = graphqlQuery(query);

  console.log("RESULT = ", result);
  return result;
}

export function getPost(slug: string) {
  const query = `{post(id:"${slug}"){title, content, date}}`
  return graphqlQuery(query)
}

async function graphqlQuery(query: string) {
  const res = await fetch("https://blog.progressivevictory.win/graphql/", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  })
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return res.json()
}
