const HEADLESS_WORDPRESS_SANDBOX_URL =
  "https://bpheadlessb110.wpenginepowered.com/graphql";

export async function getPosts() {
  const query = `{posts{edges{node{title, excerpt, content, date, id}}}}`;
  return await graphqlQuery(query);
}

export async function getPost(slug: string) {
  const query = `{post(id:"${slug}"){title, content, date}}`;
  return await graphqlQuery(query);
}

async function graphqlQuery(query: string) {
  const res = await fetch(HEADLESS_WORDPRESS_SANDBOX_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });
  const data = await res.json();
  return data;
}
